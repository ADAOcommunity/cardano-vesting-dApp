import { VestingForm } from "@/components/form/create-form";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Layout from "@/components/ui/layout";
import { Separator } from "@/components/ui/separator";
import { UserContext } from "../_app";
import { useContext, useEffect } from "react";
import { getUserAddressesAndPkhs, getUtxosForAddresses } from "@/utils/utils";

export default function Dashboard() {
    const { lucid, user } = useContext(UserContext)
    const contractAddress = "addr_test1wzyjcvjr5ykjpme62gwj6agkhdecl5l6l7wm4l9gjel854s8k70mz"
    useEffect(() => {
        if (user.walletName && lucid) {
            getUserAddressesAndPkhs(user.walletName)
                .then(
                    async (addresses) => {
                        if (addresses) {
                            const utxos = await getUtxosForAddresses(lucid, contractAddress, addresses)
                            console.log(utxos)
                        }
                    }
                )
        }
    }, [user.walletName, lucid])
    return (
        <>
            <Layout>
                <div>
                    <VestingForm />
                </div>
            </Layout>
        </>
    )
}