<template>
  <q-layout view="hhr lpR fFf">

    <q-header elevated class="bg-primary text-white">

      <q-toolbar>

        <q-avatar rounded>
          <img
            alt="FlowAgenda logo"
            src="@/assets/logo.png"
          />
        </q-avatar>

        <q-toolbar-title>
          FlowAgenda
        </q-toolbar-title>

      </q-toolbar>
    </q-header>

    <q-page-container class="page-container">
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<script>

export default {
  name: 'MainLayout'
}

</script>

<style lang="sass" scoped>
.page-container
  margin: 0 auto
  max-width: 1920px
  background: $accent
</style>
