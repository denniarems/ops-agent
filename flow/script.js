document.addEventListener('DOMContentLoaded', () => {

    lucide.createIcons();

    try {
        mermaid.initialize({
            startOnLoad: true,
            theme: 'dark',
            securityLevel: 'loose',
            fontFamily: 'Inter, sans-serif',
            themeVariables: {
                // Global text and background settings
                primaryColor: '#1e40af',
                primaryTextColor: '#ffffff',
                primaryBorderColor: '#93c5fd',
                lineColor: '#d1d5db',
                sectionBkgColor: '#1f2937',
                altSectionBkgColor: '#374151',
                gridColor: '#6b7280',
                secondaryColor: '#7c3aed',
                tertiaryColor: '#059669',
                background: '#111827',
                mainBkg: '#1f2937',
                secondBkg: '#374151',
                tertiaryBkg: '#4b5563',
                darkMode: true,
                fontFamily: 'Inter, sans-serif',

                // Enhanced flowchart/graph styling
                nodeBkg: '#1f2937',
                nodeBorder: '#93c5fd',
                clusterBkg: '#374151',
                clusterBorder: '#93c5fd',
                defaultLinkColor: '#d1d5db',
                titleColor: '#ffffff',
                edgeLabelBackground: '#1f2937',

                // Enhanced sequence diagram styling
                actorBkg: '#1f2937',
                actorBorder: '#93c5fd',
                actorTextColor: '#ffffff',
                actorLineColor: '#d1d5db',
                signalColor: '#d1d5db',
                signalTextColor: '#ffffff',
                labelBoxBkgColor: '#1f2937',
                labelBoxBorderColor: '#93c5fd',
                labelTextColor: '#ffffff',
                loopTextColor: '#ffffff',
                noteBorderColor: '#93c5fd',
                noteBkgColor: '#1f2937',
                noteTextColor: '#ffffff',
                activationBorderColor: '#60a5fa',
                activationBkgColor: '#1e40af',
                sequenceNumberColor: '#ffffff',

                // Text colors for all diagram types
                textColor: '#ffffff',
                taskTextColor: '#ffffff',
                taskTextOutsideColor: '#ffffff',
                taskTextLightColor: '#ffffff',
                taskTextDarkColor: '#ffffff',
                activeTaskBkgColor: '#1e40af',
                activeTaskBorderColor: '#93c5fd',
                gridColor: '#c5c5c5ff',
                section0: '#1f2937',
                section1: '#374151',
                section2: '#4b5563',
                section3: '#6b7280'
            },
            flowchart: {
                useMaxWidth: true,
                htmlLabels: true,
                curve: 'basis',
                nodeSpacing: 50,
                rankSpacing: 80,
                padding: 20
            },
            sequence: {
                diagramMarginX: 80,
                diagramMarginY: 20,
                actorMargin: 80,
                width: 200,
                height: 80,
                boxMargin: 15,
                boxTextMargin: 8,
                noteMargin: 15,
                messageMargin: 50,
                mirrorActors: true,
                bottomMarginAdj: 1,
                useMaxWidth: true,
                wrap: true,
                labelBoxWidth: 70,
                labelBoxHeight: 30,
                messageFontWeight: 500,
                messageFontSize: 18,
                messageFontFamily: 'Inter, sans-serif'
            },
            gantt: {
                titleTopMargin: 25,
                barHeight: 20,
                barGap: 4,
                topPadding: 50,
                leftPadding: 75,
                gridLineStartPadding: 35,
                fontSize: 11,
                sectionFontSize: 11,
                numberSectionStyles: 4,
                axisFormat: '%Y-%m-%d',
            }
        });

        console.log('Mermaid initialized successfully');

    } catch (e) {
        console.error("Error initializing Mermaid:", e);
    }
});
