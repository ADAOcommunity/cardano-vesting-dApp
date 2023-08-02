use aiken/hash.{Blake2b_224, Hash}
//  TESTS
use aiken/interval.{Finite, Interval, IntervalBound, PositiveInfinity}
use aiken/list.{and, or}
use aiken/transaction.{ScriptContext, Spend, Transaction, ValidityRange}
use aiken/transaction/credential.{VerificationKey}

type Datum {
  /// Beneficiary's credentials
  beneficiary: VerificationKeyHash,
  /// POSIX time in second, e.g. 1672843961000
  date: POSIXTime,
}

// amount: Int,
// token: ByteArray,

type VerificationKeyHash =
  Hash<Blake2b_224, VerificationKey>

type POSIXTime =
  Int

validator {
  fn vesting(datum: Datum, _redeemer: Void, ctx: ScriptContext) {
    // In principle, scripts can be used for different purpose (e.g. minting
    // assets). Here we make sure it's only used when 'spending' from a eUTxO
    when ctx.purpose is {
      Spend(_) ->
        and(
          [
            must_be_signed_by(ctx.transaction, datum.beneficiary),
            must_start_after(ctx.transaction.validity_range, datum.date),
          ],
        )
      _ ->
        False
    }
  }
}

fn must_be_signed_by(transaction: Transaction, vk: VerificationKeyHash) {
  list.has(transaction.extra_signatories, vk)
}

fn must_start_after(range: ValidityRange, lower_bound: POSIXTime) {
  when range.lower_bound.bound_type is {
    Finite(now) ->
      now >= lower_bound
    _ ->
      False
  }
}

test must_start_after_succeed_when_lower_bound_is_after() {
  must_start_after(interval.after(2), 1)
}

test must_start_after_succeed_when_lower_bound_is_equal() {
  must_start_after(interval.after(2), 2)
}

test must_start_after_fail_when_lower_bound_is_after() {
  !must_start_after(interval.after(2), 3)
}
