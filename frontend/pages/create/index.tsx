import { ProfileForm } from "@/components/form/create-form";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Layout from "@/components/ui/layout";
import { Separator } from "@/components/ui/separator";

export default function Create() {

    return (
        <>
            <Layout>
                <div>
                    <ProfileForm />
                </div>
            </Layout>
        </>
    )
}