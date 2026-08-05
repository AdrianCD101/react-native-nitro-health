package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeHealthDataOrigin
import com.margelo.nitro.nitrohealth.NativeHealthSampleIdentity
import com.margelo.nitro.nitrohealth.NativeHealthSampleIdentityKind

internal fun makeRecordIdentity(recordId: String): NativeHealthSampleIdentity {
    return NativeHealthSampleIdentity(
        kind = NativeHealthSampleIdentityKind.RECORD,
        id = recordId,
        recordId = recordId
    )
}

internal fun makeRecordChildIdentity(
    recordId: String,
    childIndex: Int
): NativeHealthSampleIdentity {
    return NativeHealthSampleIdentity(
        kind = NativeHealthSampleIdentityKind.RECORDCHILD,
        id = "$recordId#$childIndex",
        recordId = recordId
    )
}

internal fun makeHealthDataOrigin(packageName: String): NativeHealthDataOrigin {
    return NativeHealthDataOrigin(identifier = packageName, displayName = null)
}
