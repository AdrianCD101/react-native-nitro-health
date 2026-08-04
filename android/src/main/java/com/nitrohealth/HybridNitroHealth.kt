package com.nitrohealth

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.aggregate.AggregationResult
import androidx.health.connect.client.permission.HealthPermission
import androidx.health.connect.client.records.ActiveCaloriesBurnedRecord
import androidx.health.connect.client.records.DistanceRecord
import androidx.health.connect.client.records.ExerciseSessionRecord
import androidx.health.connect.client.records.HeartRateRecord
import androidx.health.connect.client.records.HeartRateVariabilityRmssdRecord
import androidx.health.connect.client.records.HeightRecord
import androidx.health.connect.client.records.OxygenSaturationRecord
import androidx.health.connect.client.records.Record
import androidx.health.connect.client.records.RestingHeartRateRecord
import androidx.health.connect.client.records.SleepSessionRecord
import androidx.health.connect.client.records.StepsRecord
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
import com.margelo.nitro.nitrohealth.AuthorizationRequestStatus
import com.margelo.nitro.nitrohealth.BackgroundDeliveryFrequency
import com.margelo.nitro.nitrohealth.BackgroundReadAuthorizationStatus
import com.margelo.nitro.nitrohealth.HealthAuthorizationStatus
import com.margelo.nitro.nitrohealth.HealthAvailabilityStatus
import com.margelo.nitro.nitrohealth.HybridNitroHealthSpec
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSample
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSampleInput
import com.margelo.nitro.nitrohealth.NativeActiveEnergyBurnedSamplePage
import com.margelo.nitro.nitrohealth.NativeBodyMassSample
import com.margelo.nitro.nitrohealth.NativeBodyMassSampleInput
import com.margelo.nitro.nitrohealth.NativeBodyMassSamplePage
import com.margelo.nitro.nitrohealth.NativeDistanceSample
import com.margelo.nitro.nitrohealth.NativeDistanceSampleInput
import com.margelo.nitro.nitrohealth.NativeDistanceSamplePage
import com.margelo.nitro.nitrohealth.NativeHealthAuthorizationResult
import com.margelo.nitro.nitrohealth.NativeHealthChangesResult
import com.margelo.nitro.nitrohealth.NativeHealthDateRangeQuery
import com.margelo.nitro.nitrohealth.NativeHealthPermission
import com.margelo.nitro.nitrohealth.NativeHealthStatistics
import com.margelo.nitro.nitrohealth.NativeHealthStatisticsQuery
import com.margelo.nitro.nitrohealth.NativeHealthTimeRangeQuery
import com.margelo.nitro.nitrohealth.NativeHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeHeartRateSamplePage
import com.margelo.nitro.nitrohealth.NativeHeartRateStatistics
import com.margelo.nitro.nitrohealth.NativeHeartRateVariabilitySample
import com.margelo.nitro.nitrohealth.NativeHeartRateVariabilitySamplePage
import com.margelo.nitro.nitrohealth.NativeHeightSample
import com.margelo.nitro.nitrohealth.NativeHeightSampleInput
import com.margelo.nitro.nitrohealth.NativeHeightSamplePage
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSample
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSampleInput
import com.margelo.nitro.nitrohealth.NativeOxygenSaturationSamplePage
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSample
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSampleInput
import com.margelo.nitro.nitrohealth.NativeRestingHeartRateSamplePage
import com.margelo.nitro.nitrohealth.NativeSleepSessionInput
import com.margelo.nitro.nitrohealth.NativeSleepSamplePage
import com.margelo.nitro.nitrohealth.NativeStepSample
import com.margelo.nitro.nitrohealth.NativeStepSampleInput
import com.margelo.nitro.nitrohealth.NativeStepSamplePage
import com.margelo.nitro.nitrohealth.NativeWorkoutSample
import com.margelo.nitro.nitrohealth.NativeWorkoutSamplePage
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

    override fun enableBackgroundDelivery(
        dataType: String,
        frequency: BackgroundDeliveryFrequency
    ): Promise<Unit> {
        return Promise.rejected(
            UnsupportedOperationException(
                "Background change notifications are unavailable on Android; request background read authorization and schedule app-owned WorkManager polling instead"
            )
        )
    }

    override fun disableBackgroundDelivery(dataType: String): Promise<Unit> {
        return Promise.rejected(
            UnsupportedOperationException("Background change notifications are unavailable on Android")
        )
    }

    override fun disableAllBackgroundDelivery(): Promise<Unit> {
        return Promise.rejected(
            UnsupportedOperationException("Background change notifications are unavailable on Android")
        )
    }

    override fun setOnChangeNotificationListener(
        listener: ((Array<String>, String) -> Unit)?
    ) {
        throw UnsupportedOperationException(
            "Background change notifications are unavailable on Android; use app-owned WorkManager polling"
        )
    }

    override fun acknowledgeChangeNotification(deliveryId: String) {
        // Android cannot create change notifications, so there is nothing to acknowledge.
    }

    override fun getBackgroundReadAuthorizationStatus(): Promise<BackgroundReadAuthorizationStatus> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(BackgroundReadAuthorizationStatus.UNAVAILABLE)

        if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
            return Promise.resolved(BackgroundReadAuthorizationStatus.UNAVAILABLE)
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            getBackgroundReadAuthorizationStatus(context, client)
        }
    }

    override fun requestBackgroundReadAuthorization(): Promise<BackgroundReadAuthorizationStatus> {
        val context = NitroModules.applicationContext
            ?: return Promise.resolved(BackgroundReadAuthorizationStatus.UNAVAILABLE)

        if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
            return Promise.resolved(BackgroundReadAuthorizationStatus.UNAVAILABLE)
        }

        return Promise.async {
            val client = HealthConnectClient.getOrCreate(context)
            val currentStatus = getBackgroundReadAuthorizationStatus(context, client)

            if (currentStatus != BackgroundReadAuthorizationStatus.NOTGRANTED) {
                return@async currentStatus
            }

            NitroHealthPermissionActivity.requestPermissions(
                context,
                setOf(backgroundReadPermission)
            )
            getBackgroundReadAuthorizationStatus(context, client)
        }
    }

    override fun createChangesToken(dataType: String): Promise<String> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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
                pageToken = query.cursor?.let { decodeSampleCursor(it, "steps", query.ascending) }
            )
            val response = client.readRecords(request)

            NativeStepSamplePage(
                samples = response.records.map { record ->
                    NativeStepSample(
                        uuid = record.metadata.id,
                        startTimeMs = record.startTime.toEpochMilli().toDouble(),
                        endTimeMs = record.endTime.toEpochMilli().toDouble(),
                        count = record.count.toDouble()
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("steps", query.ascending, it) }
            )
        }
    }

    override fun readDistance(query: NativeHealthDateRangeQuery): Promise<NativeDistanceSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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
                pageToken = query.cursor?.let { decodeSampleCursor(it, "distance", query.ascending) }
            )
            val response = client.readRecords(request)

            NativeDistanceSamplePage(
                samples = response.records.map { record ->
                    NativeDistanceSample(
                        uuid = record.metadata.id,
                        startTimeMs = record.startTime.toEpochMilli().toDouble(),
                        endTimeMs = record.endTime.toEpochMilli().toDouble(),
                        distanceMeters = record.distance.inMeters
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("distance", query.ascending, it) }
            )
        }
    }

    override fun readActiveEnergyBurned(query: NativeHealthDateRangeQuery): Promise<NativeActiveEnergyBurnedSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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
                pageToken = query.cursor?.let { decodeSampleCursor(it, "activeEnergyBurned", query.ascending) }
            )
            val response = client.readRecords(request)

            NativeActiveEnergyBurnedSamplePage(
                samples = response.records.map { record ->
                    NativeActiveEnergyBurnedSample(
                        uuid = record.metadata.id,
                        startTimeMs = record.startTime.toEpochMilli().toDouble(),
                        endTimeMs = record.endTime.toEpochMilli().toDouble(),
                        kilocalories = record.energy.inKilocalories
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("activeEnergyBurned", query.ascending, it) }
            )
        }
    }

    override fun readHeartRate(query: NativeHealthDateRangeQuery): Promise<NativeHeartRateSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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
                pageToken = query.cursor?.let { decodeSampleCursor(it, "heartRate", query.ascending) }
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
                nextCursor = response.pageToken?.let { encodeSampleCursor("heartRate", query.ascending, it) }
            )
        }
    }

    override fun readBodyMass(query: NativeHealthDateRangeQuery): Promise<NativeBodyMassSamplePage> {
        return Promise.async {
            val response = readInstantRecords<WeightRecord>("bodyMass", query)
            NativeBodyMassSamplePage(
                samples = response.records.map { record ->
                    NativeBodyMassSample(
                        uuid = record.metadata.id,
                        startTimeMs = record.time.toEpochMilli().toDouble(),
                        endTimeMs = record.time.toEpochMilli().toDouble(),
                        kilograms = record.weight.inKilograms,
                        source = record.metadata.dataOrigin.packageName
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("bodyMass", query.ascending, it) }
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

        if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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
            pageToken = query.cursor?.let { decodeSampleCursor(it, dataType, query.ascending) }
        )

        return client.readRecords(request)
    }

    override fun readRestingHeartRate(
        query: NativeHealthDateRangeQuery
    ): Promise<NativeRestingHeartRateSamplePage> {
        return Promise.async {
            val response = readInstantRecords<RestingHeartRateRecord>("restingHeartRate", query)
            NativeRestingHeartRateSamplePage(
                samples = response.records.map { record ->
                    NativeRestingHeartRateSample(
                        uuid = record.metadata.id,
                        timeMs = record.time.toEpochMilli().toDouble(),
                        bpm = record.beatsPerMinute.toDouble(),
                        source = record.metadata.dataOrigin.packageName
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("restingHeartRate", query.ascending, it) }
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
                        uuid = record.metadata.id,
                        timeMs = record.time.toEpochMilli().toDouble(),
                        milliseconds = record.heartRateVariabilityMillis,
                        method = "rmssd",
                        source = record.metadata.dataOrigin.packageName
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("heartRateVariability", query.ascending, it) }
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
                        uuid = record.metadata.id,
                        timeMs = record.time.toEpochMilli().toDouble(),
                        percentage = record.percentage.value,
                        source = record.metadata.dataOrigin.packageName
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("oxygenSaturation", query.ascending, it) }
            )
        }
    }

    override fun readHeight(query: NativeHealthDateRangeQuery): Promise<NativeHeightSamplePage> {
        return Promise.async {
            val response = readInstantRecords<HeightRecord>("height", query)
            NativeHeightSamplePage(
                samples = response.records.map { record ->
                    NativeHeightSample(
                        uuid = record.metadata.id,
                        timeMs = record.time.toEpochMilli().toDouble(),
                        meters = record.height.inMeters,
                        source = record.metadata.dataOrigin.packageName
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("height", query.ascending, it) }
            )
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

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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
            max = values["max"]
        )
    }

    override fun readSleepSamples(query: NativeHealthDateRangeQuery): Promise<NativeSleepSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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
                pageToken = query.cursor?.let { decodeSampleCursor(it, "sleep", query.ascending) }
            )
            val response = client.readRecords(request)
            // Paging counts sessions (pageSize/limit and the cursor operate on records, not
            // flattened stages), so every stage of every returned session is kept — capping
            // in post would silently drop data between pages.
            val samples = response.records.flatMap { record ->
                makeNativeSleepSamples(record).asIterable()
            }

            val ordered = if (query.ascending) {
                samples.sortedBy { it.startTimeMs }
            } else {
                samples.sortedByDescending { it.startTimeMs }
            }

            NativeSleepSamplePage(
                samples = ordered.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("sleep", query.ascending, it) }
            )
        }
    }

    override fun readWorkouts(query: NativeHealthDateRangeQuery): Promise<NativeWorkoutSamplePage> {
        return Promise.async {
            val context = NitroModules.applicationContext
                ?: throw IllegalStateException("Android application context is unavailable")

            if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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
                pageToken = query.cursor?.let { decodeSampleCursor(it, "workout", query.ascending) }
            )
            val response = client.readRecords(request)

            NativeWorkoutSamplePage(
                samples = response.records.map { record ->
                    NativeWorkoutSample(
                        uuid = record.metadata.id,
                        startTimeMs = record.startTime.toEpochMilli().toDouble(),
                        endTimeMs = record.endTime.toEpochMilli().toDouble(),
                        // Wall-clock duration; ExerciseSessionRecord has no pause-aware duration
                        // on the record itself (iOS uses the pause-aware HKWorkout.duration).
                        durationSeconds = (record.endTime.toEpochMilli() - record.startTime.toEpochMilli()) / 1000.0,
                        activityType = makeWorkoutActivityType(record.exerciseType),
                        title = record.title,
                        source = record.metadata.dataOrigin.packageName,
                        // Health Connect sessions carry no totals; per-session aggregation is a
                        // deliberate follow-up (one extra IPC call per session).
                        totalDistanceMeters = null,
                        totalEnergyBurnedKcal = null
                    )
                }.toTypedArray(),
                nextCursor = response.pageToken?.let { encodeSampleCursor("workout", query.ascending, it) }
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

    override fun saveDistance(samples: Array<NativeDistanceSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("distance")
            client.insertRecords(toDistanceRecords(samples))
            Unit
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

    override fun saveHeartRate(samples: Array<NativeHeartRateSampleInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("heartRate")
            client.insertRecords(toHeartRateRecords(samples))
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

    override fun saveSleepSessions(sessions: Array<NativeSleepSessionInput>): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient("sleep")
            client.insertRecords(toSleepSessionRecords(sessions))
            Unit
        }
    }

    override fun deleteSamplesByUuids(dataType: String, uuids: Array<String>): Promise<Unit> {
        return Promise.async {
            val recordIds = ensureDeletableRecordIds(uuids)
            val client = requireWritableClient(dataType)
            // Health Connect only deletes records owned by the calling app, and delete-by-id is
            // transactional: a nonexistent or foreign id fails the whole call (see README).
            client.deleteRecords(
                recordType = healthDataTypeDescriptorFor(dataType).recordType,
                recordIdsList = recordIds,
                clientRecordIdsList = emptyList()
            )
            Unit
        }
    }

    override fun deleteSamplesByTimeRange(
        dataType: String,
        query: NativeHealthTimeRangeQuery
    ): Promise<Unit> {
        return Promise.async {
            val client = requireWritableClient(dataType)
            client.deleteRecords(
                recordType = healthDataTypeDescriptorFor(dataType).recordType,
                timeRangeFilter = TimeRangeFilter.between(
                    Instant.ofEpochMilli(query.startTimeMs.toLong()),
                    Instant.ofEpochMilli(query.endTimeMs.toLong())
                )
            )
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

    private suspend fun requireWritableClient(dataType: String): HealthConnectClient {
        val context = NitroModules.applicationContext
            ?: throw IllegalStateException("Android application context is unavailable")

        if (getAvailabilityStatus() != HealthAvailabilityStatus.AVAILABLE) {
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
