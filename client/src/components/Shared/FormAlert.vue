<template>
    <v-alert type="error" color="error" :value="true" transition="scale-transition" dismissible>
        <h3>{{message}}</h3>
    </v-alert>
</template>

<script>
export default {
    props: ['message']
}
</script>