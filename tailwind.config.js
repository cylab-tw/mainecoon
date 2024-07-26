/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [
        function ({addUtilities}) {
            const newUtilities = {
                ".scrollbar-thin": {
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgb(31 29 29) white",
                    borderRadius: "50px",
                },
                ".scrollbar-thin-report": {
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgb(31 29 29) white",
                    borderRadius: "25px",
                },
                ".scrollbar-html-thin": {
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgb(192 192 192) white",
                    borderRadius: "50px",
                },
                ".scrollbar-webkit": {
                    "&::-webkit-scrollbar": {
                        width: "4px"
                    },
                    "&::-webkit-scrollbar-track": {
                        background: "white"
                    },
                    "&::-webkit-scrollbar-thumb": {
                        background: "rgba(31 41 55)",
                        borderRadius: "50px",
                        border: "0.5px solid white"
                    }
                },
                ".custom-height": {
                    height: "calc(90vh - 5rem)"
                }
            }
            addUtilities(newUtilities, ["responsive", "hover"])
        }
    ],
}

