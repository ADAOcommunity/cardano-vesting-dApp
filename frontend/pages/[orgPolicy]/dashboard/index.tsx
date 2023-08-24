import { VestingForm } from "@/components/form/create-form";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Layout from "@/components/ui/layout";
import { Separator } from "@/components/ui/separator";
import { UserContext } from "../../_app";
import { useContext, useEffect } from "react";
import { getUserAddressesAndPkhs, getUtxosForAddresses } from "@/utils/utils";
import DashboardPage from "@/components/dashboard/dashboard";
import OrgDashboard from "@/components/dashboard/org-dashboard";

export default function Dashboard() {
    return (
        <>
            <Layout title="Dashboard" description="Organization dashboard" >
                <div>
                    <OrgDashboard />
                </div>
            </Layout>
        </>
    )
}