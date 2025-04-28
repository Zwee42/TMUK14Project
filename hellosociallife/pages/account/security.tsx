import { useRouter } from 'next/router';
import { GetServerSideProps } from 'next';
import { requireAuth } from '@/utils/auth';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
    return await requireAuth(ctx) || { redirect: { destination: '/', permanent: false } };
};

export default function SecurityPage() {
    const router = useRouter();

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm("Are you sure you want to delete your account?");
        if (!confirmDelete) return;

        const email = localStorage.getItem('userEmail');

        if (!email) {
            alert('No email found, please login again');
            return;
        }

        const res = await fetch('/api/deleteUser', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
            alert('Account deleted successfully');
            localStorage.removeItem('userEmail');
            window.location.href = '/'
        } else {
            alert('Failed to delete account: ' + data.error);
        }
    };

    const handleForgotPassword = async () => {
        const email = prompt("Enter your email address:");
        if (!email) return;

        const res = await fetch('/api/forgotPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await res.json();

        if (res.ok) {
            alert("Password reset link has been sent to your email.");
        } else {
            alert("Error: " + data.error);
        }
    };

    const backToAccount = (e: React.MouseEvent) => {
        e.preventDefault();
        window.location.href = "/account";
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#001a33] via-[#003366] to-[#004d7a] text-gray-200 p-8 font-sans">
            <h2 className="text-3xl mb-6 font-semibold text-[#00bfff] drop-shadow-[0_0_12px_rgba(0,191,255,0.9)]">
                Security Settings
            </h2>

            <form className="flex flex-col gap-6">

                <button
                    onClick={handleForgotPassword}
                    className="px-10 py-3 text-lg bg-[#000814] text-[#00bfff] border-2 border-[#00bfff] rounded-xl shadow-[0_0_15px_rgba(0,191,255,0.4)] transition-all duration-300 hover:bg-[#001a33]"
                >
                    Reset Password
                </button>

                <button
                    onClick={handleDeleteAccount}
                    className="px-10 py-3 text-lg bg-red-600 text-white border-2 border-red-700 rounded-xl shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all duration-300 hover:bg-red-700"
                >
                    Delete Account
                </button>

                <div className="mt-6 text-center text-gray-400">
                    <button
                        onClick={backToAccount}
                        className="text-lg text-[#00bfff] hover:underline"
                    >
                        Back to Account
                    </button>
                </div>
            </form>
        </div>
    );
};