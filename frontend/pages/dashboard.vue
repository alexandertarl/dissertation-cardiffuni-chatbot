<template>
    <div class="flex justify-center bg-chatbot-black dark:bg-chatbot-font">
        <div>
            <!-- analytics for recent conversations and messages -->
            <div class="mt-10 flex text-black">
                <TopStats
                    :stat-title="$t('dashboard.conversations')"
                    :stat-timerange="$t('dashboard.lastMinute')"
                    :stat-value="jsonData?.conversation_1m"
                >
                </TopStats>
                <TopStats
                    :stat-title="$t('dashboard.conversations')"
                    :stat-timerange="$t('dashboard.avgLasthour')"
                    :stat-value="jsonData?.conversation_1h"
                ></TopStats>
                <TopStats
                    :stat-title="$t('dashboard.authUserMessage')"
                    :stat-timerange="$t('dashboard.avg24hr')"
                    :stat-value="jsonData?.authenticated_24h"
                ></TopStats>
                <TopStats
                    :stat-title="$t('dashboard.unauthUserMessage')"
                    :stat-timerange="$t('dashboard.avg24hr')"
                    :stat-value="jsonData?.unauthenticated_24h"
                ></TopStats>
                <TopStats
                    :stat-title="$t('dashboard.msgCount')"
                    :stat-timerange="$t('dashboard.sentReceived24h')"
                    :stat-value="jsonData?.messages_24h"
                ></TopStats>
            </div>

            <!-- line charts for conversations over 1 day and 1 hour, and tool usage pie chart -->
            <div class="mt-10">
                <div>
                    <h1 class="font-mono text-xl uppercase text-white">{{ $t("dashboard.recentActivity") }}</h1>
                    <div class="flex">
                        <MidStats :stat-title="$t('dashboard.numberOfConv24h')">
                            <LineChart :data="convDayDataSet" :options="hourChartOptions" />
                        </MidStats>
                        <MidStats :stat-title="$t('dashboard.numberOfConv1h')">
                            <LineChart :data="convHourDataSet" :options="minuteChartOptions" />
                        </MidStats>
                        <MidStats :stat-title="$t('dashboard.toolUsage')">
                            <PieChart :data="toolsPieChartData" />
                        </MidStats>
                    </div>
                </div>
            </div>

            <!-- line charts for conversations and messages over 7 days -->
            <div class="mt-10">
                <div>
                    <h1 class="font-mono text-xl uppercase text-white">{{ $t("dashboard.historicalStats") }}</h1>
                    <div class="flex">
                        <BottomStats :stat-title="$t('dashboard.numberOfMessages7d')">
                            <LineChart :data="messages7DataSet" :options="dayChartOptions" />
                        </BottomStats>
                        <BottomStats :stat-title="$t('dashboard.numberOfConv7d')">
                            <LineChart :data="conversationsSevenDataSet" :options="dayChartOptions" />
                        </BottomStats>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="h-full">
        <AdminChatbot class="h-full"></AdminChatbot>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();
const { token } = useAuth();
const { data: authData } = useAuth();

definePageMeta({ middleware: "auth" });

// Check if the 'admin' property exists and has a truthy value in the 'data.value' object.
if (!authData.value?.admin) {
    // If the 'admin' property is missing, undefined, or false, redirect the user to the homepage.
    navigateTo("/");
}

// fetch analytics data
const { data: jsonData } = await useFetch(`${config.public.apiURL}/admin/query`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
        Authorization: token.value,
    },
});

// format pie chart labels from for example: 'search_uni_website' to 'Search Uni Website'
const formatLabel = str => {
    return str.replace(/_/g, " ").replace(/\b\w/g, match => match.toUpperCase());
};

// analytics data
// first row of graph data
const conversationsDayChart = jsonData.value?.conversations_1d_chart || [];
const conversationsHourChart = jsonData.value?.conversations_1h_chart || [];

// pie chart data
const toolsData = jsonData.value?.tools;
// format labels for chart
const labels = Object.keys(toolsData);
formatLabel(toolsData.toString());
const formattedLabels = labels.map(formatLabel);

// second row of graph data
const conversations7DChart = jsonData.value?.conversations_7d_chart || [];
const messages7DChart = jsonData.value?.messages_7d_chart || [];

// data set for conversations over the most recent 7 days
const conversationsSevenDataSet = {
    datasets: [
        {
            label: "Conversations",
            data: conversations7DChart.map(item => ({
                x: new Date(item.x),
                y: item.y,
            })),
            borderColor: "#1d65a6",
            tension: 0.1,
        },
    ],
};

// data set for messages over the most recent 7 days
const messages7DataSet = {
    datasets: [
        {
            label: "Messages",
            data: messages7DChart.map(item => ({
                x: new Date(item.x),
                y: item.y,
            })),
            borderColor: "#00743f",
            tension: 0.1,
        },
    ],
};

// data set for conversations over the past day
const convDayDataSet = {
    datasets: [
        {
            label: "Conversations",
            data: conversationsDayChart.map(item => ({
                x: new Date(item.x),
                y: item.y,
            })),
            borderColor: "#e52918",
            tension: 0.1,
        },
    ],
};

// data set for conversations over the past hour
const convHourDataSet = {
    datasets: [
        {
            label: "Conversations",
            data: conversationsHourChart.map(item => ({
                x: new Date(item.x),
                y: item.y,
            })),
            borderColor: "#f25117",
            tension: 0.1,
        },
    ],
};

// data for the pie chart showing tools
const toolsPieChartData = {
    labels: formattedLabels,
    datasets: [
        {
            backgroundColor: ["#192e5b", "#1d65a6", "#72a2c0", "#00743f", "#f2a104", "#f25117"], // colours for each tool
            data: Object.values(toolsData),
        },
    ],
};

// options for data with unit in days
const dayChartOptions = {
    maintainAspectRatio: false,
    scales: {
        x: {
            responsive: true,
            title: {
                display: true,
                text: "Time",
            },
            type: "time",
            time: {
                unit: "day",
            },
        },
        y: {
            ticks: {
                beginAtZero: true,
            },
        },
    },
};

// options for data with unit in hours
const hourChartOptions = {
    maintainAspectRatio: false,
    scales: {
        x: {
            responsive: true,
            title: {
                display: true,
                text: "Time",
            },
            type: "time",
            time: {
                unit: "hour",
            },
            ticks: {
                stepSize: 4, // set the step size to 2 hours
                maxRotation: 45,
                minRotation: 30,
            },
        },
        y: {
            ticks: {
                beginAtZero: true,
            },
        },
    },
};

// options for data with unit in minutes
const minuteChartOptions = {
    maintainAspectRatio: false,
    scales: {
        x: {
            responsive: true,
            title: {
                display: true,
                text: "Time",
            },
            type: "time",
            time: {
                unit: "minute",
            },
            ticks: {
                stepSize: 10, // set the step size to 5 minutes
                maxRotation: 45,
                minRotation: 30,
            },
        },
        y: {
            ticks: {
                beginAtZero: true,
            },
        },
    },
};
</script>
