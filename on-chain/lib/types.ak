use aiken/hash.{Blake2b_224, Hash}
use aiken/transaction/credential.{Script, VerificationKey}
use aiken/transaction/value

pub type Action {
  Mint
  Burn
}

pub type Datum {
  /// Beneficiary's credentials
  beneficiary: VerificationKeyHash,
  /// POSIX time in second for when the vesting schedule starts, e.g. 1672843961000
  date: POSIXTime,
  /// The amount of tokens to be required for cancellation.
  tokens_required: Int,
  /// The organizations token policy id.
  org_token: value.PolicyId,
  /// The beacon token policy id.
  beacon_token: value.PolicyId,
  /// number of periods
  num_periods: Int,
  /// Amount of days that each vesting period lasts.
  period_length: Int,
  /// Amount per period
  amount_per_period: Int,
  ///policy id of the vested token
  token_policy_id: ByteArray,
  /// Name of the vested token
  token_name: ByteArray,
}

//add function to check amount to be claimed based on period length? make it so that it can be linear (meaning they can claim so amount proportional to the amount of time that has passed or time remaining till the end of the vesting period)

pub type VerificationKeyHash =
  Hash<Blake2b_224, VerificationKey>

pub type POSIXTime =
  Int

pub type ScriptHash =
  Hash<Blake2b_224, Script>
