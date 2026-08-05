package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeDeletedCountStatus
import com.margelo.nitro.nitrohealth.NativeHealthDeleteResult
import com.margelo.nitro.nitrohealth.NativeHealthDeleteStatus

internal fun makeCompletedIdDeleteResult(deletedCount: Int): NativeHealthDeleteResult {
    return NativeHealthDeleteResult(
        status = NativeHealthDeleteStatus.COMPLETED,
        deletedCountStatus = NativeDeletedCountStatus.KNOWN,
        deletedCount = deletedCount.toDouble()
    )
}

internal fun makeCompletedTimeRangeDeleteResult(): NativeHealthDeleteResult {
    return NativeHealthDeleteResult(
        status = NativeHealthDeleteStatus.COMPLETED,
        deletedCountStatus = NativeDeletedCountStatus.UNVERIFIABLE,
        deletedCount = null
    )
}
