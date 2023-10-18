import { BeaconBeaconToken, VestingVesting } from "@/validators/plutus";
import { C, Constr, Data, Lucid, UTxO, WalletApi, fromHex } from "lucid-cardano";

export type DatumsAndAmounts = {
    datum: {
        datumId: string;
        beneficiary: string;
        date: bigint;
        tokensRequired: bigint;
        orgToken: string;
        beaconToken: string;
        numPeriods: bigint;
        periodLength: bigint;
        amountPerPeriod: bigint;
        tokenPolicyId: string;
        tokenName: string;
    };
    tokenAmount: bigint;
}[]

export const tokenNameFromHex = (assetName: string) => {
    return Buffer.from(assetName, 'hex').toString('utf-8')
}
export const getAssetsFromStakeAddress = async (lucid: Lucid) => {
    const stakeAddress = await lucid.wallet.rewardAddress()
    let allBalance: any = [];
    try {
        let paginating = true;
        let page = 1;
        while (paginating) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BLOCKFROST_URL}/accounts/${stakeAddress}/addresses/assets?page=${page}`,
                    {
                        headers: {
                            'project_id': process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY as string
                        }
                    }
                )
                const resp: { unit: string, quantity: string }[] = await res.json()
                if (resp.length === 0) {
                    paginating = false;
                    break;
                }
                allBalance = [...allBalance, ...resp]
                page++;
            } catch (e) {
                paginating = false;
            }
        }
        const resp = allBalance
            .filter((v: any) => v.unit !== 'lovelace' && BigInt(v.quantity) > BigInt(1))
            .map((v: any) => {
                const policyId = v.unit.slice(0, 56);
                const assetName = v.unit.slice(56);
                return {
                    unit: v.unit,
                    policyId,
                    assetName: tokenNameFromHex(assetName),
                    quantity: v.quantity,
                };
            });
        console.log({ resp })
        return resp
    } catch (e) {
        console.log(e)
    }
    console.log({ allBalance })
    return allBalance
}

const getPaymentKeyHash = (address: any) => {
    try {
        const pkh = C.BaseAddress.from_address(
            C.Address.from_bytes(address.to_bytes())
        )
        if (!pkh) throw ""
        const pkh2 = pkh
            .payment_cred()
            .to_keyhash()
        if (!pkh2) throw ""
        return Buffer.from(
            pkh2
                .to_bytes()
        ).toString('hex');
    } catch (e) { }
    try {
        const pkh = C.EnterpriseAddress.from_address(
            C.Address.from_bytes(address.to_bytes())
        )
        if (!pkh) throw ""
        const pkh2 = pkh
            .payment_cred()
            .to_keyhash()
        if (!pkh2) throw ""
        return Buffer.from(
            pkh2
                .to_bytes()
        ).toString('hex');
    } catch (e) { }
    try {
        const pkh = C.PointerAddress.from_address(
            C.Address.from_bytes(address.to_bytes())
        )
        if (!pkh) throw ""
        const pkh2 = pkh
            .payment_cred()
            .to_keyhash()
        if (!pkh2) throw ""
        return Buffer.from(
            pkh2
                .to_bytes()
        ).toString('hex');
    } catch (e) { }
    throw Error('Not supported address type');
};

export const getUserAddressesAndPkhs = async (walletName: string) => {
    const walletApi = await window?.cardano[walletName]?.enable()
    const unused = await walletApi.getUnusedAddresses()
    const used = await walletApi.getUsedAddresses()
    const all = unused.concat(used)
    const addresses = all.map((addr: any) => {
        try {
            const address = C.Address.from_bytes(
                fromHex(addr),
            )

            return (
                {
                    address: address.to_bech32(undefined),
                    pkh: getPaymentKeyHash(address)
                }
            )
        } catch (e) {
            console.log(e)
            return null
        }

    })
        .filter((addr: any) => addr !== null)
    console.log({ addresses })
    return addresses
}

export const getUtxosForAddresses = async (lucid: Lucid, contractAddress: string, addresses: ({ address: string, pkh: string } | null)[]) => {
    // TO DO: check multiple addresses
    const utxos = await lucid.utxosAt(contractAddress)
    const formattedUtxos = []
    const totals: { [key: string]: bigint } = {}
    const claimable: {
        assets: {
            [key: string]: bigint

        },
        utxos: UTxO[]
    } = { assets: {}, utxos: [] }
    for (let utxo of utxos) {
        try {
            const datum: Constr<any> = await lucid.datumOf(utxo)
            console.log({ datum })
            // const datumJSON = Data.toJson(Data.from(datum))
            // const datumJSON = Data.toJson(datum)  //for latest lucid
            //console.log({datumJSON})
            const datumJSON = { beneficiary: datum.fields[0], date: Number(datum.fields[1]) }
            console.log({ datumJSON })
            if (addresses.filter((addr) => addr?.pkh === datumJSON?.beneficiary).length === 0) continue
            formattedUtxos.push({ ...utxo, datum: datumJSON })

            for (let assetName of Object.keys(utxo.assets)) {
                const amount = utxo.assets[assetName]
                totals[assetName] = totals[assetName] ? totals[assetName] + amount : amount
                if (datumJSON?.date < Date.now()) {
                    console.log({ date: datumJSON.date })
                    claimable.assets[assetName] = claimable.assets[assetName] ? claimable.assets[assetName] + BigInt(amount) : BigInt(amount)
                }
            }
            if (datumJSON?.date < Date.now()) {
                console.log({ utxo, date: datumJSON.date })
                claimable.utxos = [...claimable.utxos, utxo]
            }

            // const datumJSON =  Data.toJson(datum)

        } catch (e) {
            console.log(e)
        }


    }

    return { utxos: formattedUtxos, claimable, totals }
}

export const getOrgDatumsAndAmount = async (lucid: Lucid, orgPolicy: string): Promise<DatumsAndAmounts> => {
    const vestingValidator = new VestingVesting()
    const myAddress = "addr_test1qrsaj9wppjzqq9aa8yyg4qjs0vn32zjr36ysw7zzy9y3xztl9fadz30naflhmq653up3tkz275gh5npdejwjj23l0rdquxfsdj"
    const myAddressDetails = lucid?.utils.getAddressDetails(myAddress)
    const stakeCredential = myAddressDetails?.stakeCredential
    const beaconPolicy = new BeaconBeaconToken(lucid!.utils.validatorToScriptHash(vestingValidator), stakeCredential!.hash)
    const beaconPolicyId = lucid!.utils.mintingPolicyToId(beaconPolicy)
    const contractAddress = lucid!.utils.validatorToAddress(vestingValidator, stakeCredential)
    let orgUtxos = await lucid!.utxosAtWithUnit(contractAddress, beaconPolicyId + orgPolicy)
    console.log({ orgUtxos })
    const datums = orgUtxos.filter((utxo: UTxO) => utxo.datum !== null).map((utxo: UTxO) => {
        const convertedDatum = Data.from(utxo.datum as string, VestingVesting.datum)
        return {
            datum: convertedDatum,
            tokenAmount: utxo.assets[beaconPolicyId + orgPolicy]
        }
    })
    return datums
}

export const evenDigits = (n: number) => {
    let str = n.toString();
    return str.length % 2 === 0 ? str : '0' + str;
}
export const getOrgStats = async (lucid: Lucid, orgPolicy: string) => {
    const vestingValidator = new VestingVesting()
    const myAddress = "addr_test1qrsaj9wppjzqq9aa8yyg4qjs0vn32zjr36ysw7zzy9y3xztl9fadz30naflhmq653up3tkz275gh5npdejwjj23l0rdquxfsdj"
    const myAddressDetails = lucid?.utils.getAddressDetails(myAddress)
    const stakeCredential = myAddressDetails?.stakeCredential
    const beaconPolicy = new BeaconBeaconToken(lucid!.utils.validatorToScriptHash(vestingValidator), stakeCredential!.hash)
    const beaconPolicyId = lucid!.utils.mintingPolicyToId(beaconPolicy)
    const contractAddress = lucid!.utils.validatorToAddress(vestingValidator, stakeCredential)
    console.log({ contractAddress })
    let orgUtxos = await lucid!.utxosAtWithUnit(contractAddress, beaconPolicyId + orgPolicy)
    console.log({ orgUtxos })
    let stats: Stats = { beneficiaries: {}, totals: {} }
    const datums = orgUtxos.filter((utxo: UTxO) => utxo.datum !== null).forEach((utxo: UTxO) => {
        const datum = Data.from(utxo.datum as string, VestingVesting.datum)
        console.log({datum})
        const assetName = datum.tokenPolicyId+datum.tokenName;
        const tokenAmount= utxo.assets[datum.tokenPolicyId+datum.tokenName] // amount of tokens remaining in the UTxO
        const totalVested = datum.amountPerPeriod * datum.numPeriods;
        const withdrawn = totalVested - tokenAmount;
        const remaining = totalVested - withdrawn;
        const withdrawablePeriods = calculateWithdrawablePeriods(datum.periodLength, datum.date) 
        const withdrawableToDate = withdrawablePeriods > 0 ? BigInt(withdrawablePeriods) * datum.amountPerPeriod : BigInt(0);
        const redeemable = withdrawableToDate - withdrawn; // amount withdrawable to date discounting what has already been withdrawn
        let utxos: {datum: typeof datum, utxo: UTxO}[] = [{utxo: utxo, datum: datum}]
        // Populate beneficiaries
        if (!stats.beneficiaries[datum.beneficiary]) {
            stats.beneficiaries[datum.beneficiary] = {};
        }
        stats.beneficiaries[datum.beneficiary][assetName] = {
            totalVested,
            redeemable,
            withdrawn,
            remaining,
            withdrawablePeriods,
            utxos
        };

        // Populate totals
        if (!stats.totals[assetName]) {
            stats.totals[assetName] = {
                totalVested: BigInt(0),
                redeemable: BigInt(0),
                withdrawn: BigInt(0),
                remaining: BigInt(0)
            };
        }
        stats.totals[assetName].totalVested += totalVested;
        stats.totals[assetName].redeemable += redeemable;
        stats.totals[assetName].withdrawn += withdrawn;
        stats.totals[assetName].remaining += remaining;
    })
    return stats
}

export const calculateWithdrawablePeriods = (periodLength: bigint, startDate:bigint) =>{
    const periodMs = Number(periodLength)*24*60*60*1000
    console.log({periodMs})
    const withdrawablePeriods = Date.now() > Number(startDate)+periodMs ?  Math.floor((Date.now() - Number(startDate)) / periodMs) : 0;
    return withdrawablePeriods
}
type Stats = {
    beneficiaries: {
        [key: string]: { //beneficiary
            [key: string]: {  // asset name of vested token
                totalVested: bigint,
                withdrawablePeriods: number,
                redeemable: bigint,
                withdrawn: bigint,
                remaining: bigint,
                utxos: {datum: VestingVesting["datum"], utxo: UTxO}[]
            }
        }
    },
    totals: {
        [key: string]: {  // asset name of vested token
            totalVested: bigint,
            redeemable: bigint,
            withdrawn: bigint,
            remaining: bigint,
        }
    }
}

export const getTokenHoldersAndPkhs = async (lucid: Lucid, orgToken: string) => {
    const holders = await fetch(`${process.env.NEXT_PUBLIC_BLOCKFROST_URL}/assets/${orgToken}/addresses`,
        {
            headers: {
                'project_id': process.env.NEXT_PUBLIC_BLOCKFROST_API_KEY as string
            }
        }
    )
    const holdersJSON = await holders.json()
    const holdersWithPkh = holdersJSON.map((holder: any) => {
        const pkh= lucid.utils.getAddressDetails(holder.address)?.paymentCredential?.hash!
        return {
            ...holder,
            pkh
        }
    })
    return holdersWithPkh
}

export const multiplyFloatByBigInt = (floatNumber: number, bigIntNumber: bigint) => {
    // Break the floating-point number into its integer and fractional parts
    const integerPart = BigInt(Math.trunc(floatNumber));
    const fractionalPart = floatNumber - Math.trunc(floatNumber);
  
    // Multiply the integer part by the BigInt
    const integerProduct = integerPart * bigIntNumber;
  
    // Multiply the fractional part by the BigInt, round the result, and convert it back to a BigInt
    const fractionalProduct = BigInt(Math.round(fractionalPart * Number(bigIntNumber)));
  
    // Add the results of integerProduct and fractionalProduct
    const result = integerProduct + fractionalProduct;
    console.log({result, floatNumber, bigIntNumber})
    return result;
  }


  //This function takes a float number and returns the bigint amount of the token after considering the amount of decimals of the token
export const applyTokenDecimals = async (unit: string, amount: number): Promise<{quantity: bigint, decimals: number}> => {
    if (unit != "lovelace") {
        try {
            const resp = await fetch(`${process.env.BLOCKFROST_URL}/assets/${unit}`, {
                headers: { project_id: process.env.BLOCKFROST_PROJECT_ID as string },
            }).then((res) => res.json());
            if (resp.metadata && resp.metadata.decimals > 0) {
                return { quantity: multiplyFloatByBigInt(amount, BigInt(10 ** resp.metadata.decimals)), decimals: resp.metadata.decimals }
                //    }

            } else {
                return { quantity: BigInt(Math.trunc(amount)), decimals: 0}
            }

        } catch (err) {
            console.log(err)
            throw Error("Error getting token metadata")
            //return { quantity: BigInt(0), decimals: 0 }
        }
    } else {
        return { quantity: multiplyFloatByBigInt(amount, BigInt(10 ** 6)), decimals: 6 }
    }
}