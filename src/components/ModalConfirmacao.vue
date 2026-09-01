<template>
<q-dialog ref="dialogRef" @hide="onDialogHide">
  <q-card class="q-dialog-plugin">

    <q-card-section class="row items-center q-pa-sm bg-blue text-white">
      <span class="text-h6">{{ titulo }}</span>
      <q-space />
      <q-btn
        icon="close"
        flat
        dense
        round
        v-close-popup
      />
    </q-card-section>


    <q-card-section class="q-pa-none flex flex-center q-mt-lg q-mb-md">

      <div>{{ texto }}</div>

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
        :label="btnLabelOk"
        color="primary"
        no-caps
        @click="onDialogOK"
      />
    </q-card-actions>
  </q-card>
</q-dialog>
</template>

<script>
  import { useDialogPluginComponent } from 'quasar'

  export default {
    name: 'ModalConfirmacao',

    props: {
      titulo: {
        type: String,
        required: true,
        default: ''
      },
      texto: {
        type: String,
        required: true,
        default: ''
      },
      btnLabelOk: {
        type: String,
        required: true,
        default: ''
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
    }
  }
</script>
