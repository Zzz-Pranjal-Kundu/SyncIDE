import Link from "next/link";
import {BarChart3, Blocks} from "lucide-react";
import ThemeSelector from "@/app/(root)/_components/ThemeSelector";
import HeaderProfileBtn from "@/app/(root)/_components/HeaderProfileBtn";

export default function AnalyzeHeader() {
  return (
    <div className="relative z-10">
      <div className="flex items-center lg:justify-between justify-center bg-[#0b0b10]/90 backdrop-blur-md p-6 mb-4 rounded-lg">
        <div className="hidden lg:flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 blur-xl" />

            <div className="relative bg-gradient-to-br from-[#1c1c2e] to-[#0b0b10] p-2 rounded-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all">
              <Blocks className="size-6 text-indigo-400 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500" />
            </div>

            <div className="flex flex-col">
              <span className="block text-lg font-semibold bg-gradient-to-r from-indigo-400 via-blue-300 to-purple-400 text-transparent bg-clip-text">
                SyncIDE
              </span>
              <span className="block text-xs text-indigo-300/60 font-medium">
                Dynamic Code Workspace
              </span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          <ThemeSelector />

          <Link
            href="/analysis"
            className="relative group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl overflow-hidden 
                 bg-gradient-to-r from-purple-600 to-purple-500 hover:opacity-90 transition-opacity shadow-md">
            <BarChart3 className="w-4 h-4 text-white/90 group-hover:scale-110 group-hover:text-white transition-transform" />
            <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">
              Analyze Code
            </span>
          </Link>

          <div className="pl-3 border-l border-gray-800">
            <HeaderProfileBtn />
          </div>
        </div>
      </div>
    </div>
  );
}