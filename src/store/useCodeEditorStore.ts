import { LANGUAGE_CONFIG } from "@/app/(root)/_constants";
import { Monaco } from "@monaco-editor/react";
import { create } from "zustand";
import { CodeEditorState } from "./../types/index";
import { compileFunction } from "vm";


const getInitialState = () => {   // Loads persisted user preferences
    //if we are on the server,  return the default values
    if(typeof window === "undefined"){
        return {
            language: "javascript",
            fontSize: 16,
            theme: "vs-dark",
        }
    }

    //if we're on the client, return values from local storage because localstorage is a browser API only
    const savedLanguage = localStorage.getItem("editor-language") || "javascript";   // if no language is chosen, then use javascript by default
    const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
    const savedFontSize = localStorage.getItem("editor-font-size") || 16

    return {
        language: savedLanguage,
        theme: savedTheme,
        fontSize: Number(savedFontSize),
    };
}

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {    // added <CodeEditorState> to ensure type safety
    const initialState = getInitialState(); // to keep a track of the initial state and ensure that each time we reload the page, some default values are present in the IDE
    return {
        ...initialState,
        output: "",
        isRunning: false,
        error: null,
        editor: null,
        executionResult: null,

        getCode: () => get().editor?.getValue() || "",

        setEditor: (editor:Monaco) => {
            const savedCode = localStorage.getItem(`editor-code-${get().language}`)
            if(savedCode)
                editor.setValue(savedCode);
            
            set({editor});
        },

        setTheme: (theme: string) => {
            localStorage.setItem("editor-theme",theme);
            set({theme});
        },

        setFontSize: (fontSize: number) => {
            localStorage.setItem("editor-font-size", fontSize.toString());
            set({fontSize});
        },

        setLanguage: (language: string) => {
            // Save the current language code before switching
            const currentCode = get().editor?.getValue();
            if(currentCode)
                localStorage.setItem(`editor-code-${get().language}`, currentCode);  // Saves current code in localStorage (keyed by language)

            // Switch to the new language
            localStorage.setItem("editor-language", language);

            //Update the editor and set the new language
            set({
                language,
                output: "",
                error: null,
            });
        },

        runCode: async () => {
            const {language, getCode} = get();
            const code = getCode();

            if(!code){
                set({error: "Please enter some code"})
                return
            }
            set({isRunning: true, error: null, output: ""}) // update all the other states, if any errors existed, reset all of those
            try {
                const runtime = LANGUAGE_CONFIG[language].pistonRuntime;
                const response = await fetch("https://emkc.org/api/v2/piston/execute", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        language: runtime.language,
                        version: runtime.version,
                        files: [{content:code}]
                    })
                })

                const data = await response.json();

                console.log("Data back from piston", data);
                if(data.message){
                    set({error: data.message, executionResult: {code, output: "", error: data.message}});
                    return
                }

                //handle compilation errors
                if(data.compile && data.compile.code!=0){
                    const error = data.compile.stderr || data.compile.output;
                    set({
                        error,
                        executionResult: {
                            code,
                            output: "",
                            error
                        }
                    })
                    return
                }

                //handle run time errors
                if(data.run && data.run.code!=0){
                    const error = data.run.stderr || data.run.output;
                    set({
                        error,
                        executionResult: {
                            code,
                            output: "",
                            error
                        }
                    })
                    return
                }

                //if we reach here, execution was successful
                const output = data.run.output;
                set({
                    output: output.trim(),
                    error: null,
                    executionResult: {
                        code,
                        output: output.trim(),
                        error: null
                    }
                })

            } catch (error) {
                console.log("Error running the code", error)
                set({error: "Error running the code", executionResult: {code, output: "", error: "Erorr running the code"}})   
            } finally {
                set({isRunning: false})
            }
        }
    };
});

// Function to give the latest execution result value
export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;