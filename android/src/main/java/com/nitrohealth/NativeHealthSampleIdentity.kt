package com.nitrohealth

import com.margelo.nitro.nitrohealth.NativeHealthSampleIdentityKind

internal data class NativeHealthSampleIdentity(
    val kind: NativeHealthSampleIdentityKind,
    val id: String,
    val recordId: String
)
