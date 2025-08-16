import Checkbox from "@/Components/Checkbox";
import InputError from "@/Components/InputError";
import InputLabel from "@/Components/InputLabel";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import GuestLayout from "@/Layouts/GuestLayout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route("login"), { onFinish: () => reset("password") });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {status && (
                        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-700">
                            {status}
                        </div>
                    )}

                    {/* Main login card */}
                    <div className="bg-white rounded-lg shadow-lg border border-gray-200">
                        {/* Logo dan header */}
                        <div className="text-center border-b border-gray-100">
                            <div>
                                <img
                                    src="/logo.png"
                                    alt="Logo"
                                    className="w-40 h-21 mx-auto object-cover object-center"
                                />
                            </div>
                            <h2 className="text-2xl font-semibold text-gray-900 mb-1">
                                Masuk ke Akun
                            </h2>
                            <p className="text-gray-600 text-sm">
                                Silakan masukkan detail akun Anda
                            </p>
                        </div>

                        {/* Form content */}
                        <div className="p-8 pt-6">
                            <form onSubmit={submit} className="space-y-5">
                                <div>
                                    <InputLabel
                                        htmlFor="email"
                                        value="Email"
                                        className="text-gray-700 font-medium mb-2"
                                    />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                                        autoComplete="username"
                                        isFocused={true}
                                        onChange={(e) =>
                                            setData("email", e.target.value)
                                        }
                                        placeholder="nama@email.com"
                                    />
                                    <InputError
                                        message={errors.email}
                                        className="mt-1"
                                    />
                                </div>

                                <div>
                                    <InputLabel
                                        htmlFor="password"
                                        value="Kata Sandi"
                                        className="text-gray-700 font-medium mb-2"
                                    />
                                    <TextInput
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 transition-colors text-gray-900 placeholder-gray-400"
                                        autoComplete="current-password"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                        placeholder="Masukkan kata sandi"
                                    />
                                    <InputError
                                        message={errors.password}
                                        className="mt-1"
                                    />
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <label className="flex items-center">
                                        <Checkbox
                                            name="remember"
                                            checked={data.remember}
                                            onChange={(e) =>
                                                setData(
                                                    "remember",
                                                    e.target.checked
                                                )
                                            }
                                            className="text-blue-600 focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-600">
                                            Ingat saya
                                        </span>
                                    </label>

                                    {canResetPassword && (
                                        <Link
                                            href={route("password.request")}
                                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            Lupa kata sandi?
                                        </Link>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <PrimaryButton
                                        className="w-full justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
                                        disabled={processing}
                                    >
                                        {processing ? (
                                            <div className="flex items-center">
                                                <svg
                                                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <circle
                                                        className="opacity-25"
                                                        cx="12"
                                                        cy="12"
                                                        r="10"
                                                        stroke="currentColor"
                                                        strokeWidth="4"
                                                    ></circle>
                                                    <path
                                                        className="opacity-75"
                                                        fill="currentColor"
                                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                    ></path>
                                                </svg>
                                                Memproses...
                                            </div>
                                        ) : (
                                            "Masuk"
                                        )}
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
