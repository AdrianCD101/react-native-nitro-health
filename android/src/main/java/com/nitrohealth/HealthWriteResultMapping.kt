package com.nitrohealth

import androidx.health.connect.client.HealthConnectClient
import androidx.health.connect.client.records.Record
import com.margelo.nitro.nitrohealth.NativeHealthRecordingMethod
import com.margelo.nitro.nitrohealth.NativeHealthWriteResult
import java.util.concurrent.CancellationException

internal fun makeHealthWriteResult(records: List<Record>): NativeHealthWriteResult {
    return NativeHealthWriteResult(storedRecordingMethods = recordingMethods(records))
}

internal suspend fun makeHealthWriteResult(
    client: HealthConnectClient,
    records: List<Record>,
    recordIds: List<String>
): NativeHealthWriteResult {
    return NativeHealthWriteResult(
        storedRecordingMethods = storedHealthRecordingMethods(client, records, recordIds)
    )
}

internal suspend fun storedHealthRecordingMethods(
    client: HealthConnectClient,
    records: List<Record>,
    recordIds: List<String>
): Array<NativeHealthRecordingMethod> {
    return records.mapIndexed { index, record ->
        val storedRecord = if (record.metadata.clientRecordId == null) {
            record
        } else {
            val recordId = recordIds.getOrNull(index)
            if (recordId == null) {
                record
            } else {
                try {
                    client.readRecord(record::class, recordId).record
                } catch (error: Exception) {
                    if (error is CancellationException) throw error
                    // Write-only authorization and provider read failures fall back to the
                    // normalized value without turning a successful write into a rejection.
                    record
                }
            }
        }

        nativeHealthRecordingMethod(storedRecord.metadata.recordingMethod)
    }.toTypedArray()
}

private fun recordingMethods(records: List<Record>): Array<NativeHealthRecordingMethod> {
    return records.map { record ->
        nativeHealthRecordingMethod(record.metadata.recordingMethod)
    }.toTypedArray()
}
