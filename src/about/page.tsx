import { SignedIn, SignedOut, SignOutButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Home() {
    return ( 
        <div>
            <SignedOut>
                <SignUpButton>
                  <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Sign Up
                  </button>
                </SignUpButton>
            </SignedOut>

            <UserButton />

            <SignedIn>
                <SignOutButton>
                <button className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded">
                    Sign Out
                  </button>
                </SignOutButton>
            </SignedIn>
        </div>
    );
}