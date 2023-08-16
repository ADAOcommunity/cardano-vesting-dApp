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
import { getOrgDatumsAndAmount, getOrgStats, getUserAddressesAndPkhs, getUtxosForAddresses } from "@/utils/utils"
import { useRouter } from "next/router"
import { BeaconBeaconToken, VestingVesting } from "@/validators/plutus"
import { Data, toHex, UTxO } from "lucid-cardano"
import BeneficiariesList from "../org/beneficiaries-list"
import TokenUnlockChart, { TokenUnlock } from "../charts/timeline-chart"
import StackedBarChart, { OrganizationVesting } from "../charts/stacked-bar-chart"
import TokenPieChart from "../charts/token-pie-chart"

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

const beneficiariesData = [
    {
        address: '0x1234567890abcdef1234567890abcdef12345678',
        amount: 1200,
    },
    {
        address: '0xabcdef1234567890abcdef1234567890abcdef12',
        amount: 800,
    },
    {
        address: '0x7890abcdef1234567890abcdef1234567890abcd',
        amount: 500,
    },
    {
        address: '0x567890abcdef1234567890abcdef1234567890ab',
        amount: 2500,
    },
    {
        address: '0x234567890abcdef1234567890abcdef1234567890',
        amount: 1000,
    },
];

export default function OrgDashboard() {
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
            return { orgDatums: orgDatums.value, orgStats: orgStats.value }
        }
        return null
    })
    console.log(data)
    useEffect(() => {
        if (lucid) {
            setLucidLoaded(true)
        }
    }, [lucid])

    return (
        <>

            <div className="hidden flex-col md:flex">
                <div className="flex-1 space-y-4 p-8 pt-6">
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
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Token overview</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <TokenPieChart data={beneficiariesData} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Release Timeline</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <TokenUnlockChart data={unlockData} />
                            </CardContent>
                        </Card>
                        <Card className="col-span-4">
                            <CardHeader>
                                <CardTitle>Release by Beneficiary</CardTitle>
                            </CardHeader>
                            <CardContent className="pl-2">
                                <BeneficiariesList beneficiaries={data?.orgStats.beneficiaries || {}} />
                                <StackedBarChart data={stackedBarChartData} />
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    )
}