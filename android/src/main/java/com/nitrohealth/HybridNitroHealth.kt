package com.nitrohealth

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.aggregate.AggregationResult
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.BasalBodyTemperatureRecord
import androidx.health.connect.client.records.BloodGlucoseRecord
import androidx.health.connect.client.records.BloodPressureRecord
import androidx.health.connect.client.records.BodyFatRecord
import androidx.health.connect.client.records.BodyTemperatureRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.FloorsClimbedRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.HydrationRecord
import androidx.health.connect.client.records.LeanBodyMassRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RespiratoryRateRecord
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
import androidx.health.connect.client.records.Vo2MaxRecord
import androidx.health.connect.client.records.WeightRecord
import androidx.health.connect.client.request.AggregateGroupByDurationRequest
import androidx.health.connect.client.request.AggregateGroupByPeriodRequest
import androidx.health.connect.client.request.AggregateRequest
import androidx.health.connect.client.request.ChangesTokenRequest
import androidx.health.connect.client.request.ReadRecordsRequest
import androidx.health.connect.client.response.ReadRecordsResponse
import androidx.health.connect.client.time.TimeRangeFilter
import com.margelo.nitro.NitroModules
import com.margelo.nitro.core.Promise
import com.margelo.nitro.nitrohealth.BackgroundDeliveryFrequency
import com.margelo.nitro.nitrohealth.HybridNitroHealthSpec
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSample
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSampleInput
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSamplePage
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSampleInput
import com.margelo.nitro.nitrohealth.NativeBloodGlucoseSamplePage
import com.margelo.nitro.nitrohealth.NativeBasalBodyTemperatureSample
import com.margelo.nitro.nitrohealth.NativeBasalBodyTemperatureSampleInput
import com.margelo.nitro.nitrohealth.NativeBasalBodyTemperatureSamplePage
import com.margelo.nitro.nitrohealth.NativeBodyFatSample
import com.margelo.nitro.nitrohealth.NativeBodyFatSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyFatSamplePage
import com.margelo.nitro.nitrohealth.NativeBodyTemperatureSample
import com.margelo.nitro.nitrohealth.NativeBodyTemperatureSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyTemperatureSamplePage
import com.margelo.nitro.nitrohealth.NativeBloodPressureSampleInput
import com.margelo.nitro.nitrohealth.NativeBloodPressureSamplePage
import com.margelo.nitro.nitrohealth.NativeBodyMassSample
import com.margelo.nitro.nitrohealth.NativeBodyMassSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyMassSamplePage
import com.margelo.nitro.nitrohealth.NativeDistanceSample
import com.margelo.nitro.nitrohealth.NativeDistanceSampleInput
import com.margelo.nitro.nitrohealth.NativeDistanceSamplePage
import com.margelo.nitro.nitrohealth.NativeDistanceScope
import com.margelo.nitro.nitrohealth.NativeDistanceWriteResult
import com.margelo.nitro.nitrohealth.NativeBackgroundChangesMode
import com.margelo.nitro.nitrohealth.NativeBackgroundChangesResult
import com.margelo.nitro.nitrohealth.NativeBackgroundChangesResultStatus
import com.margelo.nitro.nitrohealth.NativeFloorsClimbedSample
import com.margelo.nitro.nitrohealth.NativeFloorsClimbedSampleInput
import com.margelo.nitro.nitrohealth.NativeFloorsClimbedSamplePage
import com.margelo.nitro.nitrohealth.NativeHealthAdditionalAccessStatus
import com.margelo.nitro.nitrohealth.NativeHealthAuthorizationResult
import com.margelo.nitro.nitrohealth.NativeHealthAuthorizationStatus
import com.margelo.nitro.nitrohealth.NativeHealthAvailability
import com.margelo.nitro.nitrohealth.NativeHealthAvailabilityRecoveryResult
import com.margelo.nitro.nitrohealth.NativeHealthAvailabilityStatus
import com.margelo.nitro.nitrohealth.NativeHealthCapabilities
import com.margelo.nitro.nitrohealth.NativeHealthChangesResult
import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery
import com.margelo.nitro.nitrohealth.NativeHealthDeleteResult
import com.margelo.nitro.nitrohealth.NativeHealthPermission
import com.margelo.nitro.nitrohealth.NativeHealthPermissionStatusResult
import com.margelo.nitro.nitrohealth.NativeHealthStatistics
import com.margelo.nitro.nitrohealth.NativeHealthStatisticsQuery
import com.margelo.nitro.nitrohealth.NativeHealthTimeRangeQuery
import com.margelo.nitro.nitrohealth.NativeHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeHeartRateSamplePage
import com.margelo.nitro.nitrohealth.NativeHeartRateStatistics
import com.margelo.nitro.nitrohealth.NativeHeartRateVariabilitySample
import com.margelo.nitro.nitrohealth.NativeHeartRateVariabilitySamplePage
import com.margelo.nitro.nitrohealth.NativeHeightSample
import com.margelo.nitro.nitrohealth.NativeLeanBodyMassSample
import com.margelo.nitro.nitrohealth.NativeLeanBodyMassSampleInput
import com.margelo.nitro.nitrohealth.NativeLeanBodyMassSamplePage
import com.margelo.nitro.nitrohealth.NativeHeightSampleInput
import com.margelo.nitro.nitrohealth.NativeHeightSamplePage
import com.margelo.nitro.nitrohealth.NativeHydrationSample
import com.margelo.nitro.nitrohealth.NativeHydrationSampleInput
import com.margelo.nitro.nitrohealth.NativeHydrationSamplePage
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSample
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSampleInput
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSamplePage
import com.margelo.nitro.nitrohealth.NativePermissionActionKind
import com.margelo.nitro.nitrohealth.NativePermissionDestination
import com.margelo.nitro.nitrohealth.NativePermissionWorkflowResult
import com.margelo.nitro.nitrohealth.NativePermissionWorkflowStatus
import com.margelo.nitro.nitrohealth.NativeRespiratoryRateSample
import com.margelo.nitro.nitrohealth.NativeRespiratoryRateSampleInput
import com.margelo.nitro.nitrohealth.NativeRespiratoryRateSamplePage
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSample
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSamplePage
import com.margelo.nitro.nitrohealth.NativeSleepSessionInput
import com.margelo.nitro.nitrohealth.NativeSleepSample
import com.margelo.nitro.nitrohealth.NativeSleepSamplePage
import com.margelo.nitro.nitrohealth.NativeStepSample
import com.margelo.nitro.nitrohealth.NativeStepSampleInput
import com.margelo.nitro.nitrohealth.NativeStepSamplePage
import com.margelo.nitro.nitrohealth.NativeVo2MaxSample
import com.margelo.nitro.nitrohealth.NativeVo2MaxSampleInput
import com.margelo.nitro.nitrohealth.NativeVo2MaxSamplePage
import com.margelo.nitro.nitrohealth.NativeWorkoutSampleInput
import com.margelo.nitro.nitrohealth.NativeWorkoutSamplePage
import java.time.Instant
import java.time.ZoneId
import kotlin.reflect.KClass

class HybridNitroHealth: HybridNitroHealthSpec() {
    override fun getAvailability(): NativeHealthAvailability {
        val context = NitroModules.applicationContext
            ?: return makeUnavailableHealthConnectAvailability()
        return makeHealthConnectAvailability(
            sdkStatus = HealthConnectClient.getSdkStatus(context),
            isPlatformSupported = Build.VERSION.SDK_INT >= Build.VERSION_CODES.P
        )
    }

    override fun performAvailabilityRecovery(): Promise<NativeHealthAvailabilityRecoveryResult> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(NativeHealthAvailabilityRecoveryResult.NORECOVERYACTION)
        if (getAvailability().recovery != installOrUpdateProviderRecovery) {
            return Promise.resolved(NativeHealthAvailabilityRecoveryResult.NORECOVERYACTION)
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

        val result = try {
            context.startActivity(intent)
            NativeHealthAvailabilityRecoveryResult.OPENED
        } catch (_: ActivityNotFoundException) {
            NativeHealthAvailabilityRecoveryResult.DESTINATIONUNAVAILABLE
        } catch (_: SecurityException) {
            NativeHealthAvailabilityRecoveryResult.DESTINATIONUNAVAILABLE
        }
        return Promise.resolved(result)
    }

    override fun getCapabilities(): Promise<NativeHealthCapabilities> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(
                NativeHealthCapabilities(
                    backgroundChangesMode = NativeBackgroundChangesMode.POLLING,
                    backgroundRead = NativeHealthAdditionalAccessStatus.UNSUPPORTED,
                    historyRead = NativeHealthAdditionalAccessStatus.UNSUPPORTED
                )
            )
        if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
            return Promise.resolved(
                NativeHealthCapabilities(
                    backgroundChangesMode = NativeBackgroundChangesMode.POLLING,
                    backgroundRead = NativeHealthAdditionalAccessStatus.UNSUPPORTED,
                    historyRead = NativeHealthAdditionalAccessStatus.UNSUPPORTED
                )
            )
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            NativeHealthCapabilities(
                backgroundChangesMode = NativeBackgroundChangesMode.POLLING,
                backgroundRead = getBackgroundReadAccessStatus(context, client),
                historyRead = getHistoryReadAccessStatus(context, client)
            )
        }
    }

    override fun requestAdditionalAccess(
        access: String
    ): Promise<NativeHealthAdditionalAccessStatus> {
        val permission = when (access) {
            "background-read" -> backgroundReadPermission
            "history-read" -> historyReadPermission
            else -> throw IllegalArgumentException(
                "Unsupported additional health access '$access'; expected 'background-read' or 'history-read'"
            )
        }
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(NativeHealthAdditionalAccessStatus.UNSUPPORTED)
        if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
            return Promise.resolved(NativeHealthAdditionalAccessStatus.UNSUPPORTED)
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            val currentStatus = getAdditionalAccessStatus(access, context, client)
            if (currentStatus == NativeHealthAdditionalAccessStatus.NOTGRANTED) {
                NitroHealthPermissionActivity.requestPermissions(context, setOf(permission))
                getAdditionalAccessStatus(access, context, client)
            } else {
                currentStatus
            }
        }
    }

    override fun managePermissions(): Promise<NativePermissionWorkflowResult> {
        val availability = getAvailability()
        if (availability.status != NativeHealthAvailabilityStatus.AVAILABLE) {
            return Promise.resolved(
                NativePermissionWorkflowResult(
                    status = NativePermissionWorkflowStatus.UNAVAILABLE,
                    actionKind = null,
                    destination = null,
                    availability = availability
                )
            )
        }
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(
                NativePermissionWorkflowResult(
                    status = NativePermissionWorkflowStatus.UNAVAILABLE,
                    actionKind = null,
                    destination = null,
                    availability = makeUnavailableHealthConnectAvailability()
                )
            )
        val intent = Intent(HealthConnectClient.ACTION_HEALTH_CONNECT_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        return Promise.async {
            context.startActivity(intent)
            NativePermissionWorkflowResult(
                status = NativePermissionWorkflowStatus.USERACTIONREQUIRED,
                actionKind = NativePermissionActionKind.OPENED,
                destination = NativePermissionDestination.HEALTHCONNECTSETTINGS,
                availability = null
            )
        }
    }

    override fun revokeAllPermissions(): Promise<NativePermissionWorkflowResult> {
        val availability = getAvailability()
        val context = NitroModules.applicationContext
        if (availability.status != NativeHealthAvailabilityStatus.AVAILABLE || context == null) {
            return Promise.resolved(
                NativePermissionWorkflowResult(
                    status = NativePermissionWorkflowStatus.UNAVAILABLE,
                    actionKind = null,
                    destination = null,
                    availability = availability
                )
            )
        }

        return Promise.async {
            HealthConnectClient.getOrCreate(context).permissionController.revokeAllPermissions()
            NativePermissionWorkflowResult(
                status = NativePermissionWorkflowStatus.COMPLETED,
                actionKind = null,
                destination = null,
                availability = null
            )
        }
    }

    override fun getBackgroundChangesMode(): NativeBackgroundChangesMode {
        return NativeBackgroundChangesMode.POLLING
    }

    override fun configureBackgroundChanges(
        dataTypes: Array<String>,
        frequency: BackgroundDeliveryFrequency
    ): Promise<NativeBackgroundChangesResult> {
        require(dataTypes.isNotEmpty()) { "At least one background change data type is required" }
        dataTypes.forEach(::healthDataTypeDescriptorFor)
        return makePollingBackgroundChangesResult()
    }

    override fun disableBackgroundChanges(
        dataTypes: Array<String>?
    ): Promise<NativeBackgroundChangesResult> {
        dataTypes?.forEach(::healthDataTypeDescriptorFor)
        return makePollingBackgroundChangesResult()
    }

    override fun setOnBackgroundChangeListener(
        listener: ((Array<String>, String) -> Unit)?
    ): Boolean {
        return false
    }

    override fun acknowledgeBackgroundChange(deliveryId: String): Boolean {
        return false
    }

    override fun createChangesToken(dataType: String): Promise<String> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val descriptor = healthDataTypeDescriptorFor(dataType)
            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, dataType)
            val nativeToken = client.getChangesToken(
                ChangesTokenRequest(recordTypes = setOf(descriptor.recordType))
            )

            encodeChangesToken(dataType, nativeToken)
        }
    }

    override fun getChanges(
        dataType: String,
        changesToken: String
    ): Promise<NativeHealthChangesResult> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val descriptor = healthDataTypeDescriptorFor(dataType)
            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, dataType)
            val nativeToken = decodeChangesToken(changesToken, dataType)
            val response = client.getChanges(nativeToken)

            if (response.changesTokenExpired) {
                NativeHealthChangesResult(
                    changes = emptyArray(),
                    nextChangesToken = null,
                    hasMore = false,
                    tokenExpired = true
                )
            } else {
                NativeHealthChangesResult(
                    changes = response.changes.map { change ->
                        makeNativeHealthChange(change, dataType, descriptor.recordType)
                    }.toTypedArray(),
                    nextChangesToken = encodeChangesToken(dataType, response.nextChangesToken),
                    hasMore = response.hasMore,
                    tokenExpired = false
                )
            }
        }
    }

    override fun readSteps(query: NativeHealthDateRangeQuery): Promise<NativeStepSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, "steps")

            val request = ReadRecordsRequest(
                recordType = StepsRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt(),
                pageToken = query.cursor?.let { decodeSampleCursor(it, "steps", query) }
            )
            val response = client.readRecords(request)

            NativeStepSamplePage(
                samples = response.records.map { record ->
                    NativeStepSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        startTimeMs = record.startTime.toEpochMilli().toDouble(),
                        endTimeMs = record.endTime.toEpochMilli().toDouble(),
                        count = record.count.toDouble()
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("steps", query, it) }
            )
        }
    }

    override fun readDistance(query: NativeHealthDateRangeQuery): Promise<NativeDistanceSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, "distance")

            val request = ReadRecordsRequest(
                recordType = DistanceRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt(),
                pageToken = query.cursor?.let { decodeSampleCursor(it, "distance", query) }
            )
            val response = client.readRecords(request)

            NativeDistanceSamplePage(
                samples = response.records.map { record ->
                    NativeDistanceSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        startTimeMs = record.startTime.toEpochMilli().toDouble(),
                        endTimeMs = record.endTime.toEpochMilli().toDouble(),
                        distanceMeters = record.distance.inMeters,
                        scope = NativeDistanceScope.ACTIVITYUNSPECIFIED
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("distance", query, it) }
            )
        }
    }

    override fun readActiveEnergyBurned(query: NativeHealthDateRangeQuery): Promise<NativeActiveEnergyBurnedSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, "activeEnergyBurned")

            val request = ReadRecordsRequest(
                recordType = ActiveCaloriesBurnedRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt(),
                pageToken = query.cursor?.let { decodeSampleCursor(it, "activeEnergyBurned", query) }
            )
            val response = client.readRecords(request)

            NativeActiveEnergyBurnedSamplePage(
                samples = response.records.map { record ->
                    NativeActiveEnergyBurnedSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        startTimeMs = record.startTime.toEpochMilli().toDouble(),
                        endTimeMs = record.endTime.toEpochMilli().toDouble(),
                        kilocalories = record.energy.inKilocalories
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("activeEnergyBurned", query, it) }
            )
        }
    }

    override fun readHydration(query: NativeHealthDateRangeQuery): Promise<NativeHydrationSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, "hydration")

            val request = ReadRecordsRequest(
                recordType = HydrationRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt(),
                pageToken = query.cursor?.let { decodeSampleCursor(it, "hydration", query) }
            )
            val response = client.readRecords(request)

            NativeHydrationSamplePage(
                samples = response.records.map { record ->
                    NativeHydrationSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        startTimeMs = record.startTime.toEpochMilli().toDouble(),
                        endTimeMs = record.endTime.toEpochMilli().toDouble(),
                        milliliters = record.volume.inMilliliters
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("hydration", query, it) }
            )
        }
    }

    override fun readFloorsClimbed(query: NativeHealthDateRangeQuery): Promise<NativeFloorsClimbedSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, "floorsClimbed")

            val request = ReadRecordsRequest(
                recordType = FloorsClimbedRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt(),
                pageToken = query.cursor?.let { decodeSampleCursor(it, "floorsClimbed", query) }
            )
            val response = client.readRecords(request)

            NativeFloorsClimbedSamplePage(
                samples = response.records.map { record ->
                    NativeFloorsClimbedSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        startTimeMs = record.startTime.toEpochMilli().toDouble(),
                        endTimeMs = record.endTime.toEpochMilli().toDouble(),
                        floors = record.floors
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("floorsClimbed", query, it) }
            )
        }
    }

    override fun readHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeHeartRateSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, "heartRate")

            val request = ReadRecordsRequest(
                recordType = HeartRateRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt(),
                pageToken = query.cursor?.let { decodeSampleCursor(it, "heartRate", query) }
            )
            val response = client.readRecords(request)

            // Deliberately NOT built on readInstantRecords: a HeartRateRecord is a series record —
            // an interval holding many (time, bpm) samples — so records must be flattened to
            // individual readings, the record's source carried onto each, then ordered in post.
            // Paging counts records (pageSize/limit and the cursor operate on records, not
            // flattened samples), so every reading of every returned record is kept — capping
            // in post would silently drop data between pages.
            val samples = response.records.flatMap { record ->
                makeNativeHeartRateSamples(record).asIterable()
            }

            val ordered = if (query.ascending) {
                samples.sortedBy { it.timeMs }
            } else {
                samples.sortedByDescending { it.timeMs }
            }

            NativeHeartRateSamplePage(
                samples = ordered.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("heartRate", query, it) }
            )
        }
    }

    override fun readBodyMass(query: NativeHealthDateRangeQuery): Promise<NativeBodyMassSamplePage> {
        return Promise.async {
            val response = readInstantRecords<WeightRecord>("bodyMass", query)
            NativeBodyMassSamplePage(
                samples = response.records.map { record ->
                    NativeBodyMassSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        startTimeMs = record.time.toEpochMilli().toDouble(),
                        endTimeMs = record.time.toEpochMilli().toDouble(),
                        kilograms = record.weight.inKilograms
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("bodyMass", query, it) }
            )
        }
    }

    // Shared boilerplate for instantaneous (single-instant, one-record-per-reading) data types:
    // availability check, client creation, read-permission gate, and a time-ranged
    // ReadRecordsRequest that applies the query's ascending order, limit, and cursor directly
    // (unlike readHeartRate/readSleepSamples, these records don't need post-read flattening).
    // Returns the full response so callers can map the records and wrap the next-page token in
    // a cursor. The record class comes from the data type's descriptor; the type argument T only
    // re-states it for typed mapping at the call site, so the unchecked cast is safe as long
    // as T matches the descriptor entry for dataType.
    private suspend fun <T : Record> readInstantRecords(
        dataType: String,
        query: NativeHealthDateRangeQuery
    ): ReadRecordsResponse<T> {
        val context = NitroModules.applicationContext
            ?: throw IllegalStateException("Android application context is unavailable")

        if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
            throw IllegalStateException("Health Connect is not available")
        }

        val client = HealthConnectClient.getOrCreate(context)
        requireReadPermission(client, dataType)

        @Suppress("UNCHECKED_CAST")
        val recordType = healthDataTypeDescriptorFor(dataType).recordType as KClass<T>
        val request = ReadRecordsRequest(
            recordType = recordType,
            timeRangeFilter = TimeRangeFilter.between(
                Instant.ofEpochMilli(query.startTimeMs.toLong()),
                Instant.ofEpochMilli(query.endTimeMs.toLong())
            ),
            ascendingOrder = query.ascending,
            pageSize = query.limit.toInt(),
            pageToken = query.cursor?.let { decodeSampleCursor(it, dataType, query) }
        )

        return client.readRecords(request)
    }

    override fun readBloodPressure(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeBloodPressureSamplePage> {
        return Promise.async {
            val response = readInstantRecords<BloodPressureRecord>("bloodPressure", query)
            NativeBloodPressureSamplePage(
                samples = response.records.map(::makeNativeBloodPressureSample).toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("bloodPressure", query, it) }
            )
        }
    }

    override fun readBloodGlucose(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeBloodGlucoseSamplePage> {
        return Promise.async {
            val response = readInstantRecords<BloodGlucoseRecord>("bloodGlucose", query)
            NativeBloodGlucoseSamplePage(
                samples = response.records.map(::makeNativeBloodGlucoseSample).toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("bloodGlucose", query, it) }
            )
        }
    }

    override fun readBodyTemperature(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeBodyTemperatureSamplePage> {
        return Promise.async {
            val response = readInstantRecords<BodyTemperatureRecord>("bodyTemperature", query)
            NativeBodyTemperatureSamplePage(
                samples = response.records.map { record ->
                    NativeBodyTemperatureSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        celsius = record.temperature.inCelsius
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("bodyTemperature", query, it) }
            )
        }
    }

    override fun readRespiratoryRate(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeRespiratoryRateSamplePage> {
        return Promise.async {
            val response = readInstantRecords<RespiratoryRateRecord>("respiratoryRate", query)
            NativeRespiratoryRateSamplePage(
                samples = response.records.map { record ->
                    NativeRespiratoryRateSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        breathsPerMinute = record.rate
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("respiratoryRate", query, it) }
            )
        }
    }

    override fun readBodyFat(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeBodyFatSamplePage> {
        return Promise.async {
            val response = readInstantRecords<BodyFatRecord>("bodyFat", query)
            NativeBodyFatSamplePage(
                samples = response.records.map { record ->
                    NativeBodyFatSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        percentage = record.percentage.value
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("bodyFat", query, it) }
            )
        }
    }

    override fun readLeanBodyMass(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeLeanBodyMassSamplePage> {
        return Promise.async {
            val response = readInstantRecords<LeanBodyMassRecord>("leanBodyMass", query)
            NativeLeanBodyMassSamplePage(
                samples = response.records.map { record ->
                    NativeLeanBodyMassSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        kilograms = record.mass.inKilograms
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("leanBodyMass", query, it) }
            )
        }
    }

    override fun readBasalBodyTemperature(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeBasalBodyTemperatureSamplePage> {
        return Promise.async {
            val response = readInstantRecords<BasalBodyTemperatureRecord>("basalBodyTemperature", query)
            NativeBasalBodyTemperatureSamplePage(
                samples = response.records.map { record ->
                    NativeBasalBodyTemperatureSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        celsius = record.temperature.inCelsius
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("basalBodyTemperature", query, it) }
            )
        }
    }

    override fun readRestingHeartRate(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeRestingHeartRateSamplePage> {
        return Promise.async {
            val response = readInstantRecords<RestingHeartRateRecord>("restingHeartRate", query)
            NativeRestingHeartRateSamplePage(
                samples = response.records.map { record ->
                    NativeRestingHeartRateSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        bpm = record.beatsPerMinute.toDouble()
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("restingHeartRate", query, it) }
            )
        }
    }

    override fun readHeartRateVariability(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeHeartRateVariabilitySamplePage> {
        return Promise.async {
            val response = readInstantRecords<HeartRateVariabilityRmssdRecord>("heartRateVariability", query)
            NativeHeartRateVariabilitySamplePage(
                samples = response.records.map { record ->
                    NativeHeartRateVariabilitySample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        milliseconds = record.heartRateVariabilityMillis,
                        method = "rmssd"
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("heartRateVariability", query, it) }
            )
        }
    }

    override fun readOxygenSaturation(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeOxygenSaturationSamplePage> {
        return Promise.async {
            val response = readInstantRecords<OxygenSaturationRecord>("oxygenSaturation", query)
            NativeOxygenSaturationSamplePage(
                samples = response.records.map { record ->
                    NativeOxygenSaturationSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        percentage = record.percentage.value
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("oxygenSaturation", query, it) }
            )
        }
    }

    override fun readHeight(query: NativeHealthDateRangeQuery): Promise<NativeHeightSamplePage> {
        return Promise.async {
            val response = readInstantRecords<HeightRecord>("height", query)
            NativeHeightSamplePage(
                samples = response.records.map { record ->
                    NativeHeightSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        meters = record.height.inMeters
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("height", query, it) }
            )
        }
    }

    override fun readVo2Max(query: NativeHealthDateRangeQuery): Promise<NativeVo2MaxSamplePage> {
        return Promise.async {
            val response = readInstantRecords<Vo2MaxRecord>("vo2Max", query)
            NativeVo2MaxSamplePage(
                samples = response.records.map { record ->
                    NativeVo2MaxSample(
                        identity = makeRecordIdentity(record.metadata.id),
                        origin = makeHealthDataOrigin(record.metadata.dataOrigin.packageName),
                        timeMs = record.time.toEpochMilli().toDouble(),
                        millilitersPerKilogramPerMinute = record.vo2MillilitersPerMinuteKilogram
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("vo2Max", query, it) }
            )
        }
    }

    override fun readHeartRateStatistics(query: NativeHealthTimeRangeQuery): Promise<NativeHeartRateStatistics> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, "heartRate")

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

    override fun readStatistics(
        dataType: String,
        query: NativeHealthStatisticsQuery
    ): Promise<Array<NativeHealthStatistics>> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val descriptor = healthDataTypeDescriptorFor(dataType)
            val requestedMetrics = query.metrics.associateWith { metricName ->
                descriptor.statisticsMetrics[metricName]
                    ?: throw IllegalArgumentException(
                        "Unsupported statistics metric \"$metricName\" for data type: $dataType"
                    )
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, dataType)

            val slicer = makeBucketSlicer(query.bucket)
                ?: throw IllegalArgumentException("Unsupported statistics bucket: ${query.bucket}")
            val metrics = requestedMetrics.values.map { it.metric }.toSet()

            val samples = when (slicer) {
                is BucketSlicer.ByDuration -> {
                    val request = AggregateGroupByDurationRequest(
                        metrics = metrics,
                        timeRangeFilter = TimeRangeFilter.between(
                            Instant.ofEpochMilli(query.startTimeMs.toLong()),
                            Instant.ofEpochMilli(query.endTimeMs.toLong())
                        ),
                        timeRangeSlicer = slicer.duration
                    )
                    client.aggregateGroupByDuration(request).mapNotNull { group ->
                        makeStatistics(
                            dataType = dataType,
                            requestedMetrics = requestedMetrics,
                            result = group.result,
                            bucketStartTimeMs = group.startTime.toEpochMilli().toDouble(),
                            bucketEndTimeMs = group.endTime.toEpochMilli().toDouble(),
                            query = query
                        )
                    }
                }
                is BucketSlicer.ByPeriod -> {
                    val zoneId = ZoneId.systemDefault()
                    val request = AggregateGroupByPeriodRequest(
                        metrics = metrics,
                        timeRangeFilter = TimeRangeFilter.between(
                            Instant.ofEpochMilli(query.startTimeMs.toLong()).atZone(zoneId).toLocalDateTime(),
                            Instant.ofEpochMilli(query.endTimeMs.toLong()).atZone(zoneId).toLocalDateTime()
                        ),
                        timeRangeSlicer = slicer.period
                    )
                    client.aggregateGroupByPeriod(request).mapNotNull { group ->
                        makeStatistics(
                            dataType = dataType,
                            requestedMetrics = requestedMetrics,
                            result = group.result,
                            bucketStartTimeMs = group.startTime.atZone(zoneId).toInstant().toEpochMilli().toDouble(),
                            bucketEndTimeMs = group.endTime.atZone(zoneId).toInstant().toEpochMilli().toDouble(),
                            query = query
                        )
                    }
                }
            }

            samples.sortedBy { it.startTimeMs }.toTypedArray()
        }
    }

    private fun makeStatistics(
        dataType: String,
        requestedMetrics: Map<String, StatisticsMetricBinding>,
        result: AggregationResult,
        bucketStartTimeMs: Double,
        bucketEndTimeMs: Double,
        query: NativeHealthStatisticsQuery
    ): NativeHealthStatistics? {
        val values = requestedMetrics.mapValues { (_, binding) -> binding.extract(result) }
        if (values.values.all { it == null }) {
            return null
        }

        val range = clampDailyBucketRange(
            bucketStartTimeMs = bucketStartTimeMs,
            bucketEndTimeMs = bucketEndTimeMs,
            queryStartTimeMs = query.startTimeMs,
            queryEndTimeMs = query.endTimeMs
        )

        return NativeHealthStatistics(
            startTimeMs = range.startTimeMs,
            endTimeMs = range.endTimeMs,
            sum = values["sum"],
            avg = values["avg"],
            min = values["min"],
            max = values["max"],
            scope = if (dataType == "distance") {
                NativeDistanceScope.ACTIVITYUNSPECIFIED
            } else {
                null
            }
        )
    }

    override fun readSleepSamples(query: NativeHealthDateRangeQuery): Promise<NativeSleepSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, "sleep")

            val request = ReadRecordsRequest(
                recordType = SleepSessionRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt(),
                pageToken = query.cursor?.let { decodeSampleCursor(it, "sleep", query) }
            )
            val response = client.readRecords(request)
            // Paging counts sessions (pageSize/limit and the cursor operate on records, not
            // flattened stages), so every stage of every returned session is kept — capping
            // in post would silently drop data between pages.
            val samples = response.records.flatMap { record ->
                makeNativeSleepSamples(record).asIterable()
            }
            val ordered = if (query.ascending) {
                samples.sortedWith(compareBy({ it.startTimeMs }, { it.identity.id }))
            } else {
                samples.sortedWith(compareByDescending<NativeSleepSample> {
                    it.startTimeMs
                }.thenByDescending { it.identity.id })
            }

            NativeSleepSamplePage(
                samples = ordered.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("sleep", query, it) }
            )
        }
    }

    override fun readWorkouts(query: NativeHealthDateRangeQuery): Promise<NativeWorkoutSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
                throw IllegalStateException("Health Connect is not available")
            }

            val client = HealthConnectClient.getOrCreate(context)
            requireReadPermission(client, "workout")

            val request = ReadRecordsRequest(
                recordType = ExerciseSessionRecord::class,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                ),
                ascendingOrder = query.ascending,
                pageSize = query.limit.toInt(),
                pageToken = query.cursor?.let { decodeSampleCursor(it, "workout", query) }
            )
            val response = client.readRecords(request)

            NativeWorkoutSamplePage(
                samples = response.records.map(::makeNativeWorkoutSample).toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("workout", query, it) }
            )
        }
    }

    override fun saveSteps(samples: Array<NativeStepSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("steps")
            client.insertRecords(toStepsRecords(samples))
            Unit
        }
    }

    override fun saveDistance(
        samples: Array<NativeDistanceSampleInput>
    ): Promise<NativeDistanceWriteResult> {
        return Promise.async {
            val records = toDistanceRecords(samples)
            val client = requireWritableClient("distance")
            client.insertRecords(records)
            NativeDistanceWriteResult(storedScope = NativeDistanceScope.ACTIVITYUNSPECIFIED)
        }
    }

    override fun saveActiveEnergyBurned(
        samples: Array<NativeActiveEnergyBurnedSampleInput>
    ): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("activeEnergyBurned")
            client.insertRecords(toActiveCaloriesBurnedRecords(samples))
            Unit
        }
    }

    override fun saveHydration(samples: Array<NativeHydrationSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("hydration")
            client.insertRecords(toHydrationRecords(samples))
            Unit
        }
    }

    override fun saveFloorsClimbed(samples: Array<NativeFloorsClimbedSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("floorsClimbed")
            client.insertRecords(toFloorsClimbedRecords(samples))
            Unit
        }
    }

    override fun saveHeartRate(samples: Array<NativeHeartRateSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("heartRate")
            client.insertRecords(toHeartRateRecords(samples))
            Unit
        }
    }

    override fun saveBloodPressure(samples: Array<NativeBloodPressureSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("bloodPressure")
            client.insertRecords(toBloodPressureRecords(samples))
            Unit
        }
    }

    override fun saveBloodGlucose(samples: Array<NativeBloodGlucoseSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("bloodGlucose")
            client.insertRecords(toBloodGlucoseRecords(samples))
            Unit
        }
    }

    override fun saveBodyTemperature(samples: Array<NativeBodyTemperatureSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("bodyTemperature")
            client.insertRecords(toBodyTemperatureRecords(samples))
            Unit
        }
    }

    override fun saveBodyMass(samples: Array<NativeBodyMassSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("bodyMass")
            client.insertRecords(toWeightRecords(samples))
            Unit
        }
    }

    override fun saveRespiratoryRate(samples: Array<NativeRespiratoryRateSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("respiratoryRate")
            client.insertRecords(toRespiratoryRateRecords(samples))
        }
    }

    override fun saveBodyFat(samples: Array<NativeBodyFatSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("bodyFat")
            client.insertRecords(toBodyFatRecords(samples))
        }
    }

    override fun saveLeanBodyMass(samples: Array<NativeLeanBodyMassSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("leanBodyMass")
            client.insertRecords(toLeanBodyMassRecords(samples))
        }
    }

    override fun saveBasalBodyTemperature(samples: Array<NativeBasalBodyTemperatureSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("basalBodyTemperature")
            client.insertRecords(toBasalBodyTemperatureRecords(samples))
        }
    }

    override fun saveRestingHeartRate(samples: Array<NativeRestingHeartRateSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("restingHeartRate")
            client.insertRecords(toRestingHeartRateRecords(samples))
            Unit
        }
    }

    override fun saveOxygenSaturation(samples: Array<NativeOxygenSaturationSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("oxygenSaturation")
            client.insertRecords(toOxygenSaturationRecords(samples))
            Unit
        }
    }

    override fun saveHeight(samples: Array<NativeHeightSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("height")
            client.insertRecords(toHeightRecords(samples))
            Unit
        }
    }

    override fun saveVo2Max(samples: Array<NativeVo2MaxSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("vo2Max")
            client.insertRecords(toVo2MaxRecords(samples))
            Unit
        }
    }

    override fun saveSleepSessions(sessions: Array<NativeSleepSessionInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("sleep")
            client.insertRecords(toSleepSessionRecords(sessions))
            Unit
        }
    }

    override fun saveWorkout(workout: NativeWorkoutSampleInput): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("workout")
            client.insertRecords(listOf(toExerciseSessionRecord(workout)))
            Unit
        }
    }

    override fun deleteRecordsByIds(
        dataType: String,
        recordIds: Array<String>
    ): Promise<NativeHealthDeleteResult> {
        return Promise.async {
            val validatedRecordIds = ensureDeletableRecordIds(recordIds)
            val client = requireWritableClient(dataType)
            client.deleteRecords(
                recordType = healthDataTypeDescriptorFor(dataType).recordType,
                recordIdsList = validatedRecordIds,
                clientRecordIdsList = emptyList()
            )
            // Health Connect exposes no deleted count, and providers can ignore IDs that do not
            // match a caller-owned record. Success proves only that the delete operation completed.
            makeCompletedIdDeleteResult()
        }
    }

    override fun deleteRecordsByTimeRange(
        dataType: String,
        query: NativeHealthTimeRangeQuery
    ): Promise<NativeHealthDeleteResult> {
        return Promise.async {
            val client = requireWritableClient(dataType)
            client.deleteRecords(
                recordType = healthDataTypeDescriptorFor(dataType).recordType,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                )
            )
            makeCompletedTimeRangeDeleteResult()
        }
    }

    override fun getPermissionStatuses(
        permissions: Array<NativeHealthPermission>
    ): Promise<NativeHealthPermissionStatusResult> {
        val availability = getAvailability()
        val context = NitroModules.applicationContext
        if (availability.status != NativeHealthAvailabilityStatus.AVAILABLE || context == null) {
            return Promise.resolved(
                makePermissionStatusResult(permissions, availability)
            )
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            makePermissionStatusResult(
                permissions = permissions,
                availability = availability,
                grantedHealthConnectPermissions = client.permissionController.getGrantedPermissions()
            )
        }
    }

    override fun requestAuthorization(
        permissions: Array<NativeHealthPermission>
    ): Promise<NativeHealthAuthorizationResult> {
        val availability = getAvailability()
        val context = NitroModules.applicationContext
        if (availability.status != NativeHealthAvailabilityStatus.AVAILABLE || context == null) {
            return Promise.resolved(
                NativeHealthAuthorizationResult(
                    status = NativeHealthAuthorizationStatus.UNAVAILABLE,
                    availability = availability,
                    statuses = makePermissionStatusEntries(permissions, null)
                )
            )
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            val requestedPermissionSet = permissions.map { permission ->
                toHealthConnectPermission(permission.dataType, permission.accessType)
            }.toSet()
            val grantedPermissions = client.permissionController.getGrantedPermissions()
            if (!grantedPermissions.containsAll(requestedPermissionSet)) {
                NitroHealthPermissionActivity.requestPermissions(context, requestedPermissionSet)
            }

            NativeHealthAuthorizationResult(
                status = NativeHealthAuthorizationStatus.COMPLETED,
                availability = availability,
                statuses = makePermissionStatusEntries(
                    permissions = permissions,
                    grantedHealthConnectPermissions =
                        client.permissionController.getGrantedPermissions()
                )
            )
        }
    }

    private fun makePermissionStatusResult(
        permissions: Array<NativeHealthPermission>,
        availability: NativeHealthAvailability,
        grantedHealthConnectPermissions: Set<String>? = null
    ): NativeHealthPermissionStatusResult {
        return NativeHealthPermissionStatusResult(
            availability = availability,
            statuses = makePermissionStatusEntries(
                permissions = permissions,
                grantedHealthConnectPermissions = grantedHealthConnectPermissions
            )
        )
    }

    private suspend fun getAdditionalAccessStatus(
        access: String,
        context: android.content.Context,
        client: HealthConnectClient
    ): NativeHealthAdditionalAccessStatus {
        return when (access) {
            "background-read" -> getBackgroundReadAccessStatus(context, client)
            "history-read" -> getHistoryReadAccessStatus(context, client)
            else -> throw IllegalArgumentException(
                "Unsupported additional health access '$access'; expected 'background-read' or 'history-read'"
            )
        }
    }

    private fun makePollingBackgroundChangesResult(): Promise<NativeBackgroundChangesResult> {
        val context = NitroModules.applicationContext
        if (
            context == null ||
            getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE
        ) {
            return Promise.resolved(
                NativeBackgroundChangesResult(
                    status = NativeBackgroundChangesResultStatus.UNAVAILABLE,
                    mode = NativeBackgroundChangesMode.POLLING,
                    backgroundRead = NativeHealthAdditionalAccessStatus.UNSUPPORTED
                )
            )
        }

        return Promise.async {
            val backgroundRead = getBackgroundReadAccessStatus(
                context,
                HealthConnectClient.getOrCreate(context)
            )
            NativeBackgroundChangesResult(
                status = NativeBackgroundChangesResultStatus.USERACTIONREQUIRED,
                mode = NativeBackgroundChangesMode.POLLING,
                backgroundRead = backgroundRead
            )
        }
    }

    private suspend fun requireWritableClient(dataType: String): HealthConnectClient {
        val context = NitroModules.applicationContext
            ?: throw IllegalStateException("Android application context is unavailable")

        if (getAvailability().status != NativeHealthAvailabilityStatus.AVAILABLE) {
            throw IllegalStateException("Health Connect is not available")
        }

        val client = HealthConnectClient.getOrCreate(context)
        requireWritePermission(client, dataType)

        return client
    }

    private suspend fun requireWritePermission(client: HealthConnectClient, dataType: String) {
        val descriptor = healthDataTypeDescriptorFor(dataType)
        val permission = HealthPermission.getWritePermission(descriptor.recordType)
        if (!client.permissionController.getGrantedPermissions().contains(permission)) {
            throw SecurityException("Missing permission to write ${descriptor.permissionLabel}")
        }
    }

    private suspend fun requireReadPermission(client: HealthConnectClient, dataType: String) {
        val descriptor = healthDataTypeDescriptorFor(dataType)
        val permission = HealthPermission.getReadPermission(descriptor.recordType)
        if (!client.permissionController.getGrantedPermissions().contains(permission)) {
            throw SecurityException("Missing permission to read ${descriptor.permissionLabel}")
        }
    }

}
