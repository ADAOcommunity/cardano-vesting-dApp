import { Metadata } from "next"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import VestingList from "./vesting-list"
import Overview from "./Overview"
import { useContext, useEffect, useState } from "react"
import { UserContext } from "@/pages/_app"
import { useQuery } from "@tanstack/react-query"
import { DatumsAndAmounts, calculateWithdrawablePeriods, formatFromTokenRegistry, getOrgDatumsAndAmount, getOrgStats, getTokenHoldersAndPkhs, getUserAddressesAndPkhs, getUtxosForAddresses, tokenNameFromHex } from "@/utils/utils"
import { useRouter } from "next/router"
import { BeaconBeaconToken, VestingVesting } from "@/validators/plutus"
import { Constr, Data, toHex, UTxO } from "lucid-cardano"
import BeneficiariesList from "../org/beneficiaries-list"
import TokenUnlockChart, { TokenUnlock } from "../charts/timeline-chart"
import StackedBarChart, { OrganizationVesting } from "../charts/stacked-bar-chart"
import TokenPieChart from "../charts/token-pie-chart"
import { set } from "date-fns"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table"


export const metadata: Metadata = {
    title: "Dashboard",
    description: "Example dashboard app using the components.",
}

const unlockData: TokenUnlock[] = [
    { date: new Date('2023-01-02'), amount: 50, tokenName: "Beneficiary A" },
    { date: new Date('2023-01-03'), amount: 50, tokenName: "Beneficiary A" },
    { date: new Date('2023-01-02'), amount: 75, tokenName: "Beneficiary B" },
    { date: new Date('2023-01-02'), amount: 100, tokenName: "Beneficiary C" },

    { date: new Date('2023-02-02'), amount: 50, tokenName: "Beneficiary A" },
    { date: new Date('2023-02-02'), amount: 75, tokenName: "Beneficiary B" },
    { date: new Date('2023-02-02'), amount: 100, tokenName: "Beneficiary C" },

    { date: new Date('2023-03-02'), amount: 50, tokenName: "Beneficiary A" },
    { date: new Date('2023-03-02'), amount: 75, tokenName: "Beneficiary B" },
    { date: new Date('2023-03-02'), amount: 100, tokenName: "Beneficiary C" },


    { date: new Date('2023-04-02'), amount: 50, tokenName: "Beneficiary A" },
    { date: new Date('2023-04-02'), amount: 75, tokenName: "Beneficiary B" },
    { date: new Date('2023-04-02'), amount: 100, tokenName: "Beneficiary C" },
    // ... add more data points
];

const stackedBarChartData: OrganizationVesting = {
    orgName: "Org A",
    beneficiaries: [
        {
            beneficiaryName: "Beneficiary 1",
            vestedAmounts: [
                { tokenName: "Token A", amount: 100 },
                { tokenName: "Token B", amount: 100 },
            ],
        },
        {
            beneficiaryName: "Beneficiary 2",
            vestedAmounts: [
                { tokenName: "Token A", amount: 1000 },
            ],
        },
        {
            beneficiaryName: "Beneficiary 3",
            vestedAmounts: [
                { tokenName: "Token A", amount: 100 },
            ],
        },
        {
            beneficiaryName: "Beneficiary 4",
            vestedAmounts: [
                { tokenName: "Token A", amount: 420 },
            ],
        },
        {
            beneficiaryName: "Beneficiary 5",
            vestedAmounts: [
                { tokenName: "Token A", amount: 60 },
            ],
        },
        {
            beneficiaryName: "Beneficiary 6",
            vestedAmounts: [
                { tokenName: "Token A", amount: 75 },
                { tokenName: "Token B", amount: 20 },
            ],
        },

        {
            beneficiaryName: "Beneficiary 6",
            vestedAmounts: [
                { tokenName: "Token A", amount: 75 },
                { tokenName: "Token B", amount: 20 },
            ],
        },
        // ... other beneficiaries
    ],
};


export default function OrgDashboard() {
    const [unlockData, setUnlockData] = useState<TokenUnlock[]>([])
    const [stackedBarChartData, setStackedBarChartData] = useState<OrganizationVesting>({} as OrganizationVesting)
    const [tokenList, setTokenList] = useState<string[]>([])
    const [beneficiariesData, setBeneficiariesData] = useState<{ address: string, amount: number }[]>([])
    const { user, lucid } = useContext(UserContext)
    const router = useRouter()
    const { orgPolicy } = router.query
    const vestingValidator = new VestingVesting()
    const [lucidLoaded, setLucidLoaded] = useState(false)
    const { data, error, isLoading } = useQuery(['orgdashboard', orgPolicy, lucidLoaded], async () => {
        if (orgPolicy && lucidLoaded) {
            const [orgDatums, orgStats] = await Promise.allSettled([
                getOrgDatumsAndAmount(lucid!, orgPolicy as string),
                getOrgStats(lucid!, orgPolicy as string)
            ])

            if (orgDatums.status === 'rejected') {
                console.log('orgDatums rejected. reason:', orgDatums.reason)
                return null
            }
            if (orgStats.status === 'rejected') {
                console.log('orgStats rejected. reason:', orgStats.reason)
                return null
            }
            setTokenList(Array.from(new Set(orgDatums.value.map(datum => datum.datum.tokenPolicyId + datum.datum.tokenName))))
            return { orgDatums: orgDatums.value as DatumsAndAmounts, orgStats: orgStats.value }
        }
        return null
    })
    console.log(data)
    useEffect(() => {
        if (lucid) {
            setLucidLoaded(true)
        }
    }, [lucid])


    const createUnlockData = (data: DatumsAndAmounts) => {
        const unlockData: TokenUnlock[] = []
        for (let datum of data) {
            const d = datum.datum
            const start = new Date(Number(d.date))
            const end = new Date(Number(d.date) + Number(d.periodLength) * Number(d.numPeriods))
            for (let i = 0; i < Number(d.numPeriods); i++) {
                unlockData.push({
                    date: new Date(start.getTime() + i * Number(d.periodLength)),
                    amount: Number(d.amountPerPeriod),
                    tokenName: tokenNameFromHex(d.tokenName)
                })
            }
        }
        return unlockData

    }

    const onCancel = async (d: any) => {
        const datum = Data.to(d, VestingVesting.datum)
        const myAddress = "addr_test1qrsaj9wppjzqq9aa8yyg4qjs0vn32zjr36ysw7zzy9y3xztl9fadz30naflhmq653up3tkz275gh5npdejwjj23l0rdquxfsdj"
        const myAddressDetails = lucid?.utils.getAddressDetails(myAddress)
        const stakeCredential = myAddressDetails?.stakeCredential
        const validatorAddress = lucid!.utils.validatorToAddress(vestingValidator, stakeCredential)
        const orgToken = d.orgToken + toHex(Buffer.from("orgToken", "utf8"))
        const beaconToken = d.beaconToken + d.orgToken
        const holders = await getTokenHoldersAndPkhs(lucid!, orgToken)
        console.log({ holders })
        console.log({ datum })
        const utxo = (await lucid?.utxosAtWithUnit(validatorAddress, beaconToken))?.filter(u => u.datum === datum)
        console.log({ utxo })
        const redeemer = Data.to(new Constr(1, []))
        let tx = lucid?.newTx()
            .collectFrom(utxo as UTxO[], redeemer)
            .attachSpendingValidator(vestingValidator)

        for (let holder of holders) {
            tx = tx?.payToAddress(holder.address, { [orgToken]: BigInt(1) })
                .addSigner(holder.address)
            console.log({ holder })
        }
        const txComplete = await tx?.complete()
        const txHex = toHex(txComplete!.txComplete.to_bytes())
        router.push(`https://roundtable.adaodapp.xyz/hex/${txHex}`)
    }

    const onTokenSelect = async (tokenName: string) => {
        console.log(tokenName)
        const benefData = []
        for (let datum of data?.orgDatums.filter(datum => datum.datum.tokenPolicyId + datum.datum.tokenName === tokenName) || []) {
            const unit = datum.datum.tokenPolicyId + datum.datum.tokenName
            const amount = BigInt(datum.datum.amountPerPeriod) * BigInt(calculateWithdrawablePeriods(datum.datum.periodLength, datum.datum.date))
            const formattedData = await formatFromTokenRegistry(unit, amount)
            const formatedAmount = formattedData.quantity
            const d = {
                address: datum.datum.beneficiary,
                amount: Number(formatedAmount)
            }
            benefData.push(d)
        }
        setBeneficiariesData(benefData)

        const barChartBeneficiaries = []

        for (let beneficiary of Object.keys(data?.orgStats.beneficiaries || [])) {
            const vestedAmounts = []
            for (let tokenName of Object.keys(data?.orgStats.beneficiaries[beneficiary] || [])) {
                const formattedData = await formatFromTokenRegistry(tokenName, BigInt(data?.orgStats.beneficiaries[beneficiary][tokenName].totalVested || 0))
                const formattedAmount = formattedData.quantity
                vestedAmounts.push({
                    tokenName,
                    amount: Number(formattedAmount) || 0
                })
            }
            barChartBeneficiaries.push({
                beneficiaryName: beneficiary,
                vestedAmounts
            })

        }
        setStackedBarChartData({
            orgName: orgPolicy as string,
            beneficiaries: barChartBeneficiaries
        })
        setUnlockData(createUnlockData(data!.orgDatums))
    }

    return (
        <>

            <div className="hidden flex-col md:flex space-y-4">
                <Link href={`/${orgPolicy}/create`}><Button variant={'default'} size='lg'>New Schedule</Button></Link>

                <Select onValueChange={(e) => onTokenSelect(e)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select a token" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectLabel>Tokens</SelectLabel>

                            {
                                tokenList.map(tokenName => {
                                    return <SelectItem key={tokenName} value={tokenName}>{tokenNameFromHex(tokenName.slice(56))}</SelectItem>
                                })
                            }
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <div className="flex-1 space-y-4 p-8 pt-6 w-full">
                    <div className="flex items-center justify-between space-y-2">
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                    </div>
                    {/* <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Unlock Timeline
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <TokenUnlockChart data={unlockData}/>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Subscriptions
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+2350</div>
                                <p className="text-xs text-muted-foreground">
                                    +180.1% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <rect width="20" height="14" x="2" y="5" rx="2" />
                                    <path d="M2 10h20" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+12,234</div>
                                <p className="text-xs text-muted-foreground">
                                    +19% from last month
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    Active Now
                                </CardTitle>
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    className="h-4 w-4 text-muted-foreground"
                                >
                                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                                </svg>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+573</div>
                                <p className="text-xs text-muted-foreground">
                                    +201 since last hour
                                </p>
                            </CardContent>
                        </Card>
                    </div> */}
                    <div className="grid gap-4 w-full flex flex-wrap">
                        {beneficiariesData.length > 0 && <Card className="col-span-4 w-full">
                            <CardHeader>
                                <CardTitle>Token overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2 items-center justify-center flex">
                                <TokenPieChart data={beneficiariesData} />
                            </CardContent>
                        </Card>}
                        {unlockData.length > 0 && <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Release Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2 justify-center flex">
                                <TokenUnlockChart data={unlockData} />
                            </CardContent>
                        </Card>}
                        {stackedBarChartData?.beneficiaries && <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Release by Beneficiary</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2 justify-center flex flex-col space-y-2">
                                <BeneficiariesList beneficiaries={data?.orgStats.beneficiaries || {}} />
                                <StackedBarChart data={stackedBarChartData} />
                            </CardContent>
                        </Card>}

                        {data?.orgDatums && <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>UTxOs</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2 justify-center flex flex-col space-y-2">
                                <div>
                                    {data?.orgDatums.map((item, index) => (
                                        <Card key={index} className="m-4">
                                            <CardHeader>
                                                <CardTitle>Datum {index + 1}</CardTitle>
                                                <CardDescription>Token Amount: {item.tokenAmount.toString()}</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                {Object.entries(item.datum).map(([key, value], i) => (
                                                    <div key={i} className="flex justify-between">
                                                        <span className="font-medium">{key}:</span>
                                                        <span>{value.toString()}</span>
                                                    </div>
                                                ))}
                                                <Button onClick={() => onCancel(item.datum)} variant={"default"}>Cancel</Button>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>}
                    </div>
                </div>
            </div>
        </>
    )
}