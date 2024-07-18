<template>
    <LineChart :data="data" :options="options" />
</template>

<script setup>
import { Line as LineChart } from "vue-chartjs";
import { defineProps } from "vue";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, TimeScale);

defineProps({
    data: {
        type: Object,
        required: true,
    },
    options: {
        type: Object,
        default: () => ({
            responsive: true,
            maintainAspectRatio: false,
        }),
    },
});
</script>
