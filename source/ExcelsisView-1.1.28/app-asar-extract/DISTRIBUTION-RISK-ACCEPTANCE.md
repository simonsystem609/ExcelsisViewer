# Unsigned Windows distribution risk acceptance

Applies to: ExcelsisView 1.1.11 and later releases unless revoked  
Accepted by the project owner: 2026-07-26

The Windows installer and application binaries may be distributed without an
Authenticode signature. This is an explicitly accepted distribution risk, not
a claim that unsigned binaries have the same trust or reputation behavior as
signed binaries.

Expected effects include Microsoft Defender SmartScreen warnings, slower or
weaker reputation accumulation, and less convenient verification of publisher
identity. This decision does not change the GNU AGPL licensing of the
application and does not waive dependency updates, parser containment,
integrity verification, or the other security release gates.
