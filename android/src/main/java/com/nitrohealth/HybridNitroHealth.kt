package com.nitrohealth

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.time.TimeRangeFilter
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import com.margelo.nitro.nitrohealth.AuthorizationRequestStatus
import com.margelo.nitro.nitrohealth.HealthAuthorizationStatus
import com.margelo.nitro.nitrohealth.HealthAvailabilityStatus
import com.margelo.nitro.nitrohealth.HybridNitroHealthSpec
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSample
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyMassSample
import com.margelo.nitro.nitrohealth.NativeBodyMassSampleInput
import com.margelo.nitro.nitrohealth.NativeDistanceSample
import com.margelo.nitro.nitrohealth.NativeDistanceSampleInput
import com.margelo.nitro.nitrohealth.NativeHealthAuthorizationResult
import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery
import com.margelo.nitro.nitrohealth.NativeHealthPermission
import com.margelo.nitro.nitrohealth.NativeHealthTimeRangeQuery
import com.margelo.nitro.nitrohealth.NativeHeartRateSample
import com.margelo.nitro.nitrohealth.NativeHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeHeartRateStatistics
import com.margelo.nitro.nitrohealth.NativeSleepSample
import com.margelo.nitro.nitrohealth.NativeStepSample
import com.margelo.nitro.nitrohealth.NativeStepSampleInput
import java.time.Instant
import java.time.Period
import java.time.ZoneId
import kotlin.reflect.KClass

class HybridNitroHealth: HybridNitroHealthSpec() {
    override fun isAvailable(): Boolean {
        return getAvailabilityStatus() == HealthAvailabilityStatus.AVAILABLE
    }

    override fun getAvailabilityStatus(): HealthAvailabilityStatus {
        val context = NitroModules.applicationContext ?: return HealthAvailabilityStatus.UNAVAILABLE

        return when (HealthConnectClient.getSdkStatus(context)) {
            HealthConnectClient.SDK_AVAILABLE -> HealthAvailabilityStatus.AVAILABLE
            HealthConnectClient.SDK_UNAVAILABLE_PROVIDER_UPDATE_REQUIRED ->
                HealthAvailabilityStatus.PROVIDERUPDATEREQUIRED
            else -> HealthAvailabilityStatus.UNAVAILABLE
        }
    }

    override fun openHealthConnectInstall(): Boolean {
        val context = NitroModules.applicationContext ?: return false

        if (getAvailabilityStatus() != HealthAvailabilityStatus.PROVIDERUPDATEREQUIRED) {
            return false
        }

        val providerPackageName = "com.google.android.apps.healthdata"
        val uri = Uri.parse(
            "market://details?id=$providerPackageName&url=healthconnect%3A%2F%2Fonboarding"
        )
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setPackage("com.android.vending")
            data = uri
            putExtra("overlay", true)
            putExtra("callerId", context.packageName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        return try {
            context.startActivity(intent)
            true
        } catch (_: ActivityNotFoundException) {
            false
        }
    }

    override fun openHealthSettings(): Promise<Boolean> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(false)

        return Promise.resolved(
            try {
                val intent = Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS).apply {
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                true
            } catch (_: ActivityNotFoundException) {
                false
            }
        )
    }

    override fun readSteps(query: NativeHealthDateRangeQuery): Promise<Array<NativeStepSample>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, StepsRecord::class, "steps")

            val request = ReadRecordsRequest(
                recordType = StepsRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt()
            )
            val response = client.readRecords(request)

            response.records.map { record ->
                NativeStepSample(
                    startTimeMs = record.startTime.toEpochMilli().toDouble(),
                    endTimeMs = record.endTime.toEpochMilli().toDouble(),
                    count = record.count.toDouble()
                )
            }.toTypedArray()
        }
    }

    override fun readDailyStepTotals(query: NativeHealthDateRangeQuery): Promise<Array<NativeStepSample>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, StepsRecord::class, "steps")

            val zoneId = ZoneId.systemDefault()
            val request = AggregateGroupByPeriodRequest(
                metrics = setOf(StepsRecord.COUNT_TOTAL),
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()).atZone(zoneId).toLocalDateTime(),
                    Instant.ofEpochMilli(query.endTimeMs.toLong()).atZone(zoneId).toLocalDateTime()
                ),
                timeRangeSlicer = Period.ofDays(1)
            )
            val response = client.aggregateGroupByPeriod(request)
            val samples = response.mapNotNull { group ->
                val count = group.result[StepsRecord.COUNT_TOTAL]
                    ?: return@mapNotNull null
                val range = clampDailyBucketRange(
                    bucketStartTimeMs = group.startTime.atZone(zoneId).toInstant().toEpochMilli().toDouble(),
                    bucketEndTimeMs = group.endTime.atZone(zoneId).toInstant().toEpochMilli().toDouble(),
                    queryStartTimeMs = query.startTimeMs,
                    queryEndTimeMs = query.endTimeMs
                )

                NativeStepSample(
                    startTimeMs = range.startTimeMs,
                    endTimeMs = range.endTimeMs,
                    count = count.toDouble()
                )
            }
            orderAndLimitDailySamples(samples, query.ascending, query.limit.toInt()) { it.startTimeMs }
                .toTypedArray()
        }
    }

    override fun readDistance(query: NativeHealthDateRangeQuery): Promise<Array<NativeDistanceSample>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, DistanceRecord::class, "distance")

            val request = ReadRecordsRequest(
                recordType = DistanceRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt()
            )
            val response = client.readRecords(request)

            response.records.map { record ->
                NativeDistanceSample(
                    startTimeMs = record.startTime.toEpochMilli().toDouble(),
                    endTimeMs = record.endTime.toEpochMilli().toDouble(),
                    distanceMeters = record.distance.inMeters
                )
            }.toTypedArray()
        }
    }

    override fun readDailyDistanceTotals(query: NativeHealthDateRangeQuery): Promise<Array<NativeDistanceSample>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, DistanceRecord::class, "distance")

            val zoneId = ZoneId.systemDefault()
            val request = AggregateGroupByPeriodRequest(
                metrics = setOf(DistanceRecord.DISTANCE_TOTAL),
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()).atZone(zoneId).toLocalDateTime(),
                    Instant.ofEpochMilli(query.endTimeMs.toLong()).atZone(zoneId).toLocalDateTime()
                ),
                timeRangeSlicer = Period.ofDays(1)
            )
            val response = client.aggregateGroupByPeriod(request)
            val samples = response.mapNotNull { group ->
                val distance = group.result[DistanceRecord.DISTANCE_TOTAL]
                    ?: return@mapNotNull null
                val range = clampDailyBucketRange(
                    bucketStartTimeMs = group.startTime.atZone(zoneId).toInstant().toEpochMilli().toDouble(),
                    bucketEndTimeMs = group.endTime.atZone(zoneId).toInstant().toEpochMilli().toDouble(),
                    queryStartTimeMs = query.startTimeMs,
                    queryEndTimeMs = query.endTimeMs
                )

                NativeDistanceSample(
                    startTimeMs = range.startTimeMs,
                    endTimeMs = range.endTimeMs,
                    distanceMeters = distance.inMeters
                )
            }
            orderAndLimitDailySamples(samples, query.ascending, query.limit.toInt()) { it.startTimeMs }
                .toTypedArray()
        }
    }

    override fun readActiveEnergyBurned(query: NativeHealthDateRangeQuery): Promise<Array<NativeActiveEnergyBurnedSample>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, ActiveCaloriesBurnedRecord::class, "active energy burned")

            val request = ReadRecordsRequest(
                recordType = ActiveCaloriesBurnedRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt()
            )
            val response = client.readRecords(request)

            response.records.map { record ->
                NativeActiveEnergyBurnedSample(
                    startTimeMs = record.startTime.toEpochMilli().toDouble(),
                    endTimeMs = record.endTime.toEpochMilli().toDouble(),
                    kilocalories = record.energy.inKilocalories
                )
            }.toTypedArray()
        }
    }

    override fun readDailyActiveEnergyBurnedTotals(
        query: NativeHealthDateRangeQuery
    ): Promise<Array<NativeActiveEnergyBurnedSample>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, ActiveCaloriesBurnedRecord::class, "active energy burned")

            val zoneId = ZoneId.systemDefault()
            val request = AggregateGroupByPeriodRequest(
                metrics = setOf(ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL),
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()).atZone(zoneId).toLocalDateTime(),
                    Instant.ofEpochMilli(query.endTimeMs.toLong()).atZone(zoneId).toLocalDateTime()
                ),
                timeRangeSlicer = Period.ofDays(1)
            )
            val response = client.aggregateGroupByPeriod(request)
            val samples = response.mapNotNull { group ->
                val activeCalories = group.result[ActiveCaloriesBurnedRecord.ACTIVE_CALORIES_TOTAL]
                    ?: return@mapNotNull null
                val range = clampDailyBucketRange(
                    bucketStartTimeMs = group.startTime.atZone(zoneId).toInstant().toEpochMilli().toDouble(),
                    bucketEndTimeMs = group.endTime.atZone(zoneId).toInstant().toEpochMilli().toDouble(),
                    queryStartTimeMs = query.startTimeMs,
                    queryEndTimeMs = query.endTimeMs
                )

                NativeActiveEnergyBurnedSample(
                    startTimeMs = range.startTimeMs,
                    endTimeMs = range.endTimeMs,
                    kilocalories = activeCalories.inKilocalories
                )
            }
            orderAndLimitDailySamples(samples, query.ascending, query.limit.toInt()) { it.startTimeMs }
                .toTypedArray()
        }
    }

    override fun readHeartRate(query: NativeHealthDateRangeQuery): Promise<Array<NativeHeartRateSample>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, HeartRateRecord::class, "heart rate")

            val request = ReadRecordsRequest(
                recordType = HeartRateRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt()
            )
            val response = client.readRecords(request)

            // A HeartRateRecord is an interval that holds many (time, bpm) samples, so flatten
            // records to individual readings, carry the record's source onto each, then order and
            // cap to the requested limit (pageSize limits records, not flattened samples).
            val samples = response.records.flatMap { record ->
                record.samples.map { sample ->
                    NativeHeartRateSample(
                        timeMs = sample.time.toEpochMilli().toDouble(),
                        bpm = sample.beatsPerMinute.toDouble(),
                        source = record.metadata.dataOrigin.packageName
                    )
                }
            }

            val ordered = if (query.ascending) {
                samples.sortedBy { it.timeMs }
            } else {
                samples.sortedByDescending { it.timeMs }
            }

            ordered.take(query.limit.toInt()).toTypedArray()
        }
    }

    override fun readBodyMass(query: NativeHealthDateRangeQuery): Promise<Array<NativeBodyMassSample>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, WeightRecord::class, "body mass")

            val request = ReadRecordsRequest(
                recordType = WeightRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt()
            )
            val response = client.readRecords(request)

            response.records.map { record ->
                NativeBodyMassSample(
                    startTimeMs = record.time.toEpochMilli().toDouble(),
                    endTimeMs = record.time.toEpochMilli().toDouble(),
                    kilograms = record.weight.inKilograms,
                    source = record.metadata.dataOrigin.packageName
                )
            }.toTypedArray()
        }
    }

    override fun readHeartRateStatistics(query: NativeHealthTimeRangeQuery): Promise<NativeHeartRateStatistics> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, HeartRateRecord::class, "heart rate")

            val request = AggregateRequest(
                metrics = setOf(
                    HeartRateRecord.BPM_AVG,
                    HeartRateRecord.BPM_MIN,
                    HeartRateRecord.BPM_MAX
                ),
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                )
            )
            val result = client.aggregate(request)

            NativeHeartRateStatistics(
                average = result[HeartRateRecord.BPM_AVG]?.toDouble(),
                min = result[HeartRateRecord.BPM_MIN]?.toDouble(),
                max = result[HeartRateRecord.BPM_MAX]?.toDouble()
            )
        }
    }

    override fun readSleepSamples(query: NativeHealthDateRangeQuery): Promise<Array<NativeSleepSample>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, SleepSessionRecord::class, "sleep")

            val request = ReadRecordsRequest(
                recordType = SleepSessionRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt()
            )
            val response = client.readRecords(request)
            val samples = response.records.flatMap { record ->
                val stages = record.stages

                if (stages.isEmpty()) {
                    listOf(
                        NativeSleepSample(
                            startTimeMs = record.startTime.toEpochMilli().toDouble(),
                            endTimeMs = record.endTime.toEpochMilli().toDouble(),
                            stage = "asleep",
                            source = record.metadata.dataOrigin.packageName
                        )
                    )
                } else {
                    stages.map { stage ->
                        NativeSleepSample(
                            startTimeMs = stage.startTime.toEpochMilli().toDouble(),
                            endTimeMs = stage.endTime.toEpochMilli().toDouble(),
                            stage = makeSleepStage(stage.stage),
                            source = record.metadata.dataOrigin.packageName
                        )
                    }
                }
            }

            val ordered = if (query.ascending) {
                samples.sortedBy { it.startTimeMs }
            } else {
                samples.sortedByDescending { it.startTimeMs }
            }

            ordered.take(query.limit.toInt()).toTypedArray()
        }
    }

    override fun saveSteps(samples: Array<NativeStepSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient(StepsRecord::class, "steps")
            client.insertRecords(toStepsRecords(samples))
            Unit
        }
    }

    override fun saveDistance(samples: Array<NativeDistanceSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient(DistanceRecord::class, "distance")
            client.insertRecords(toDistanceRecords(samples))
            Unit
        }
    }

    override fun saveActiveEnergyBurned(
        samples: Array<NativeActiveEnergyBurnedSampleInput>
    ): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient(
                ActiveCaloriesBurnedRecord::class,
                "active energy burned"
            )
            client.insertRecords(toActiveCaloriesBurnedRecords(samples))
            Unit
        }
    }

    override fun saveHeartRate(samples: Array<NativeHeartRateSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient(HeartRateRecord::class, "heart rate")
            client.insertRecords(toHeartRateRecords(samples))
            Unit
        }
    }

    override fun saveBodyMass(samples: Array<NativeBodyMassSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient(WeightRecord::class, "body mass")
            client.insertRecords(toWeightRecords(samples))
            Unit
        }
    }

    override fun getRequestStatusForAuthorization(
        permissions: Array<NativeHealthPermission>
    ): Promise<AuthorizationRequestStatus> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(AuthorizationRequestStatus.UNKNOWN)

        if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
            return Promise.resolved(AuthorizationRequestStatus.UNKNOWN)
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            val grantedPermissions = client.permissionController.getGrantedPermissions()
            val requestedPermissions = permissions.map {
                toHealthConnectPermission(it.dataType, it.accessType)
            }.toSet()

            if (grantedPermissions.containsAll(requestedPermissions)) {
                AuthorizationRequestStatus.UNNECESSARY
            } else {
                AuthorizationRequestStatus.SHOULDREQUEST
            }
        }
    }

    override fun requestAuthorization(
        permissions: Array<NativeHealthPermission>
    ): Promise<NativeHealthAuthorizationResult> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(
                makeAuthorizationResult(
                    permissions = permissions,
                    availabilityStatus = HealthAvailabilityStatus.UNAVAILABLE,
                    requestStatus = AuthorizationRequestStatus.UNKNOWN
                )
            )

        val availabilityStatus = getAvailabilityStatus()

        if (availabilityStatus != HealthAvailabilityStatus.AVAILABLE) {
            return Promise.resolved(
                makeAuthorizationResult(
                    permissions = permissions,
                    availabilityStatus = availabilityStatus,
                    requestStatus = AuthorizationRequestStatus.UNKNOWN
                )
            )
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            val grantedPermissions = client.permissionController.getGrantedPermissions()
            val requestedPermissions = permissions.associateWith {
                toHealthConnectPermission(it.dataType, it.accessType)
            }
            val requestedPermissionSet = requestedPermissions.values.toSet()

            val updatedGrantedPermissions = if (grantedPermissions.containsAll(requestedPermissionSet)) {
                grantedPermissions
            } else {
                NitroHealthPermissionActivity.requestPermissions(
                    context,
                    requestedPermissionSet
                )
            }

            val grantedNativePermissions = requestedPermissions.filter { entry ->
                updatedGrantedPermissions.contains(entry.value)
            }.keys.toTypedArray()
            val deniedNativePermissions = requestedPermissions.filterNot { entry ->
                updatedGrantedPermissions.contains(entry.value)
            }.keys.toTypedArray()
            val requestStatus = if (deniedNativePermissions.isEmpty()) {
                AuthorizationRequestStatus.UNNECESSARY
            } else {
                AuthorizationRequestStatus.SHOULDREQUEST
            }

            makeAuthorizationResult(
                permissions = permissions,
                availabilityStatus = availabilityStatus,
                requestStatus = requestStatus,
                grantedPermissions = grantedNativePermissions,
                deniedPermissions = deniedNativePermissions
            )
        }
    }

    private fun makeAuthorizationResult(
        permissions: Array<NativeHealthPermission>,
        availabilityStatus: HealthAvailabilityStatus,
        requestStatus: AuthorizationRequestStatus,
        grantedPermissions: Array<NativeHealthPermission> = emptyArray(),
        deniedPermissions: Array<NativeHealthPermission> = permissions,
        unverifiablePermissions: Array<NativeHealthPermission> = emptyArray()
    ): NativeHealthAuthorizationResult {
        val status = when {
            availabilityStatus != HealthAvailabilityStatus.AVAILABLE -> HealthAuthorizationStatus.UNAVAILABLE
            deniedPermissions.isEmpty() -> HealthAuthorizationStatus.GRANTED
            grantedPermissions.isNotEmpty() || unverifiablePermissions.isNotEmpty() -> HealthAuthorizationStatus.PARTIAL
            else -> HealthAuthorizationStatus.DENIED
        }

        return NativeHealthAuthorizationResult(
            status = status,
            availabilityStatus = availabilityStatus,
            requestStatus = requestStatus,
            grantedPermissions = grantedPermissions,
            deniedPermissions = deniedPermissions,
            unverifiablePermissions = unverifiablePermissions
        )
    }

    private suspend fun requireWritableClient(
        recordType: KClass<out Record>,
        label: String
    ): HealthConnectClient {
        val context = NitroModules.applicationContext
            ?: throw IllegalStateException("Android application context is unavailable")

        if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
            throw IllegalStateException("Health Connect is not available")
        }

        val client = HealthConnectClient.getOrCreate(context)
        requireWritePermission(client, recordType, label)

        return client
    }

    private suspend fun requireWritePermission(
        client: HealthConnectClient,
        recordType: KClass<out Record>,
        label: String
    ) {
        val permission = HealthPermission.getWritePermission(recordType)
        if (!client.permissionController.getGrantedPermissions().contains(permission)) {
            throw SecurityException("Missing permission to write $label")
        }
    }

    private suspend fun requireReadPermission(
        client: HealthConnectClient,
        recordType: KClass<out Record>,
        label: String
    ) {
        val permission = HealthPermission.getReadPermission(recordType)
        if (!client.permissionController.getGrantedPermissions().contains(permission)) {
            throw SecurityException("Missing permission to read $label")
        }
    }

    private fun makeSleepStage(stage: Int): String {
        return when (stage) {
            1 -> "awake"
            2 -> "asleep"
            3 -> "outOfBed"
            4 -> "asleepCore"
            5 -> "asleepDeep"
            6 -> "asleepREM"
            7 -> "awakeInBed"
            else -> "unknown"
        }
    }
}
