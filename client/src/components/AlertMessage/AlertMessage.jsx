import React from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AlertCircle, Copy, RefreshCw } from "lucide-react";

function AlertMessage() {
    return (
        <div className="flex justify-center items-center my-6">
            <Card className="w-full max-w-6xl border-red-200 bg-red-10">
                <CardHeader className="text-center">
                    <h2 className="text-xl font-bold text-red-600 flex items-center justify-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Important Exam Guidelines
                    </h2>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
                        <Copy className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700">
                            <span className="font-semibold">Copying and pasting is strictly prohibited</span> in the exam portal.
                            Any attempt to copy content will be logged and may result in exam termination.
                        </p>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-red-100">
                        <RefreshCw className="w-5 h-5 mt-0.5 text-red-500 flex-shrink-0" />
                        <p className="text-red-700">
                            <span className="font-semibold">Tab switching is monitored</span>.
                            Switching tabs or windows may trigger automatic submission of your test.
                        </p>
                    </div>

                    <div className="text-sm text-center mt-4 font-bold">
                        Please focus on your exam and avoid any prohibited actions.
                    </div>

                </CardContent>
            </Card>
        </div>
    );
}

export default AlertMessage;