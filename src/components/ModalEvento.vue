<template>
<q-dialog ref="dialogRef" @hide="onDialogHide">
  <q-card class="q-dialog-plugin">

    <q-card-section class="row items-center q-pa-sm bg-blue text-white">
      <span class="text-h6">Evento</span>
      <q-space />
      <q-btn
        icon="close"
        flat
        dense
        round
        v-close-popup
      />
    </q-card-section>


    <q-card-section class="q-py-none q-mt-lg q-mb-md">

      <div class="q-pb-sm">
        <b>Evento:</b>
        {{ evento.title }}
      </div>

      <div class="q-pb-sm">
        <b>Detalhes:</b>
        {{ evento.details || 'Não informado' }}
      </div>

      <div class="q-pb-sm">
        <b>Local:</b>
        {{ evento.location || 'Não informado' }}
      </div>

      <div
        v-if="!evento.all_dat"
        class="q-pb-sm"
      >
        <b>Horário:</b>
        {{ evento.time_start || 'Não informado' }} - {{ evento.time_end || 'Não informado' }}
      </div>

      <div
        v-else
        class="q-pb-sm"
      >
        <b>Horário:</b>
        Dia todo
      </div>

    </q-card-section>

    <q-card-actions align="right">
      <q-btn
        label="Cancelar"
        color="primary"
        no-caps
        flat
        @click="onCancelClick"
      />
      <q-btn
        label="Excluir"
        icon="delete"
        color="red"
        no-caps
        @click="excluir"
      />
      <q-btn
        label="Editar"
        color="primary"
        icon="edit"
        no-caps
        @click="onDialogOK('editar')"
      />
    </q-card-actions>
  </q-card>
</q-dialog>
</template>

<script>
  import { useDialogPluginComponent } from 'quasar'
  import { defineAsyncComponent } from 'vue'

  export default {
    name: 'ModalEvento',

    props: {
      evento: {
        type: Object,
        required: true,
        default: () => ({})
      }
    },

    emits: [...useDialogPluginComponent.emits],

    setup() {
      const {
        dialogRef,
        onDialogHide,
        onDialogCancel,
        onDialogOK
      } = useDialogPluginComponent()

      return {
        dialogRef,
        onDialogHide,
        onCancelClick: onDialogCancel,
        onDialogOK
      }
    },

    methods: {
      excluir () {
        const dialog = this.$q.dialog({
          component: defineAsyncComponent(
            () => import('@/components/ModalConfirmacao.vue')
          ),
          componentProps: {
            titulo: 'Excluir',
            texto: `Tem certeza de que deseja excluir o evento ${this.evento.title}?`,
            btnLabelOk: 'Excluir'
          }
        })

        dialog?.onOk(() => this.onDialogOK('excluir'))
      }
    }
  }
</script>
