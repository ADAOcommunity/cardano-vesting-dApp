use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction/credential.{
  Address, Credential, Inline, ScriptCredential, VerificationKey,
  VerificationKeyCredential,
}
use aiken/transaction/value

pub type Datum {
  /// Beneficiary's credentials
  beneficiary: VerificationKeyHash,
  /// POSIX time in second, e.g. 1672843961000
  date: POSIXTime,
  /// The amount of tokens to be required for cancellation.
  tokens_required: Int,
  /// The organizations token policy id.
  org_token: value.PolicyId,
  /// The beacon token policy id.
  beacon_token: value.PolicyId,
}

pub type VerificationKeyHash =
  Hash<Blake2b_224, VerificationKey>

pub type POSIXTime =
  Int
