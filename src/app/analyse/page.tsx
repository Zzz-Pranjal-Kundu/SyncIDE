"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import NavigationHeader from "@/components/NavigationHeader";
import { Code, FileJson, FileText, ListChecks } from "lucide-react";

const analysisData = [
  {
    title: "Lexical Analysis",
    description: "Tokenize source code into meaningful lexemes.",
    icon: <FileText className="w-8 h-8 text-blue-400" />,
    href: "/analyse/lexical",
  },
  {
    title: "Syntax Analysis",
    description: "Parse code into a syntax tree to verify structure.",
    icon: <ListChecks className="w-8 h-8 text-purple-400" />,
    href: "/analyse/syntax",
  },
  {
    title: "Semantic Analysis",
    description: "Ensure code logic and meaning are valid semantically.",
    icon: <Code className="w-8 h-8 text-green-400" />,
    href: "/analyse/semantic",
  },
  {
    title: "Intermediate Code Generation",
    description: "Code's abstract, machine-independent representation.",
    icon: <FileJson className="w-8 h-8 text-teal-400" />,
    href: "/analyse/intermediateCode",
  },
];

function AnalysePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <NavigationHeader />
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r
            from-blue-500/10 to-purple-500/10 text-sm text-gray-400 mb-6"
          >
            <Code className="w-4 h-4" />
            Analysis Modules
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-100 to-gray-300 text-transparent bg-clip-text mb-6"
          >
            Dive into the world of Compiler
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-400 mb-8"
          >
            Dive into lexical, syntax, and semantic analysis of your source code
          </motion.p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {analysisData.map((item, index) => (
            <motion.div
              key={index}
              onClick={() => router.push(item.href)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="cursor-pointer bg-[#1e1e2e] p-6 rounded-xl shadow-md border border-[#313244]
                hover:shadow-xl hover:border-blue-500 transition-all duration-300"
            >
              <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-[#262637]">
                {item.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AnalysePage;
