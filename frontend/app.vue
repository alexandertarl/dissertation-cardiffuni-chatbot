<template>
    <div class="flex h-screen flex-col">
        <AppHeader class="sticky top-0 z-50 w-full" />
        <div class="flex-1 overflow-auto">
            <NuxtPage />
        </div>
    </div>
    <!-- Notifications for the app -->
    <UNotifications />
</template>
