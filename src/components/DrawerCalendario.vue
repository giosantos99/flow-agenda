<template>
<q-drawer
  :model-value="open"
  :width="400"

  bordered

  side="right"
  class="column full-height no-wrap"
>
  <q-toolbar class="bg-secondary text-white">
    <q-icon
      :name="novo_evento ? 'sym_o_calendar_add_on' : 'edit_calendar'"
      size="md"
    />
    <q-toolbar-title class="text-weight-medium">
        {{ novo_evento ? 'Adicionar' : 'Editar' }} Evento
      </q-toolbar-title>
    <q-btn
      icon="close"
      aria-label="Fechar menu"
      flat
      round
      dense
      @click="$emit('close-drawer')"
    />
  </q-toolbar>

  <q-form ref="form" @submit="salvarEvento">

    <div
      class="no-wrap scroll q-gutter-y-md q-pa-md"
      style="max-height: calc(100vh - 100px);"
    >

      <q-input
        v-model="form_drawer.title"
        label="Título"
        :rules="[val => !!val || 'Campo obrigatório']"
        filled
        autofocus
        hide-bottom-space
        dense
      />

      <q-input
        v-model="form_drawer.details"
        label="Descrição"
        hide-bottom-space
        filled
        dense
      />

      <q-select
        v-model="form_drawer.location"
        :options="form_drawer.options_location"
        label="Adicionar local"
        input-debounce="500"
        option-label="formatted"
        option-value="formatted"
        emit-value
        hide-selected
        fill-input
        use-input
        clearable
        outlined
        filled
        dense
        @filter="buscarLocalizacao"
      >
        <template v-slot:append>
          <q-icon name="sym_o_map_search" />
        </template>
      </q-select>

      <div class="q-py-sm">
        <div class="q-pb-sm">Data(s) Selecionada(s)</div>

        <div
          v-if="form_calendario.events?.length"
          class="bg-grey-2 q-py-md"
        >
          <div
            v-for="event in form_calendario.events"
            :key="event"
            class="row no-wrap q-gutter-x-sm q-pa-sm"
          >

            <q-badge color="secondary" class="row self-center" square />

            <q-input
              :model-value="formatarDataAgenda(event)"
              readonly
              filled
              hide-bottom-space
              dense
              class="col"
            >
              <template v-slot:append>
                <q-icon name="calendar_month" />
              </template>
            </q-input>

            <q-btn
              icon="event_busy"
              color="pink"
              dense
              round
              flat
              @click="desmarcarEvento(event)"
            >
              <q-tooltip v-if="!$q.screen.lt.md">Desmarcar Evento</q-tooltip>
            </q-btn>
          </div>
        </div>

      </div>

      <q-toggle
        v-model="form_drawer.all_day"
        label="Dia inteiro"
        checked-icon="schedule"
        unchecked-icon="clear"
      />

      <div
        v-if="!form_drawer.all_day"
        class="row q-gutter-x-sm no-wrap"
      >
        <q-input
          v-model="form_drawer.time_start"
          label="Hora início"
          mask="time"
          :rules="[
            val => validarFormatoHora(val) || 'Hora inválida',
            val => validarOrdemHorarios() || 'Início deve ser menor que o fim'
          ]"
          hide-bottom-space
          filled
          dense
        >
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time v-model="form_drawer.time_start">
                  <div class="row items-center justify-end">
                    <q-btn
                      label="Fechar"
                      color="primary"
                      v-close-popup
                      no-caps
                      flat
                      />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>

        <q-input
          v-model="form_drawer.time_end"
          label="Hora fim"
          mask="time"
          :rules="[
            val => validarFormatoHora(val) || 'Hora inválida',
            val => validarOrdemHorarios() || 'Fim deve ser maior que o início'
          ]"
          hide-bottom-space
          filled
          dense
        >
          <template v-slot:append>
            <q-icon name="access_time" class="cursor-pointer">
              <q-popup-proxy
                cover
                transition-show="scale"
                transition-hide="scale"
              >
                <q-time v-model="form_drawer.time_end">
                  <div class="row items-center justify-end">
                    <q-btn
                      label="Fechar"
                      color="primary"
                      v-close-popup
                      no-caps
                      flat
                      />
                  </div>
                </q-time>
              </q-popup-proxy>
            </q-icon>
          </template>
        </q-input>
      </div>


    </div>

    <div class="row justify-between no-wrap q-gutter-x-sm items-center fixed-bottom q-pa-sm q-mb-sm">
      <q-btn
        label="Cancelar"
        color="primary"
        class="col"
        flat
        dense
        no-caps
        @click="$emit('close-drawer')"
      />
      <q-btn
        v-if="!novo_evento"
        label="Excluir"
        icon="delete"
        color="pink"
        class="col"
        dense
        no-caps
        @click="excluirEvento"
      />
      <q-btn
        :label="novo_evento ? 'Adicionar' : 'Editar'"
        :icon="novo_evento ? 'save' : 'edit'"
        color="primary"
        class="col"
        type="submit"
        dense
        no-caps
      />
    </div>
  </q-form>
</q-drawer>
</template>

<script>
import { defineAsyncComponent } from 'vue'

export default {
  name: 'DrawerCalendario',

  props: {
    open: {
      type: Boolean,
      required: true
    },
    form_calendario: {
      type: Object,
      required: false,
      default: () => ({})
    },
    novo_evento: {
      type: Boolean,
      required: false,
      default: true
    }
  },

  emits: [
    'adicionar-evento',
    'editar-evento',
    'excluir-evento',
    'close-drawer',
    'desmarcar-evento'
  ],

  data () {
    return {
      form_drawer: {}
    }
  },

  computed: {
    formatarDataAgenda: {
      get () {
        return dt => dt.split('-').reverse().join('/')
      }
    }
  },

  methods: {

    convertTimeToMinutes (timeStr) {
      if (!timeStr) return 0
      const [hours, minutes] = timeStr.split(':').map(Number)

      return (hours * 60) + minutes
    },

    validarFormatoHora (horaStr) {
      if (!horaStr) return false

      const regex = /^([01]\d|2[0-3]):([0-5]\d)$/

      return regex.test(horaStr)
    },

    validarOrdemHorarios () {
      const { time_start, time_end } = this.form_drawer

      if (!time_start || !time_end) return true
      if (
        !this.validarFormatoHora(time_start) ||
        !this.validarFormatoHora(time_end)
      ) return true

      const inicioMinutos = this.convertTimeToMinutes(time_start)
      const fimMinutos = this.convertTimeToMinutes(time_end)

      return inicioMinutos < fimMinutos
    },

    async buscarLocalizacao (valor, update) {
      if (!valor || valor.length < 3) {
        update(() => this.form_drawer.options_location = [])
        return
      }

      try {
        const { data: { results } } = await this.$api.get(
          'https://api.geoapify.com/v1/geocode/autocomplete',
          {
            params: {
              text: valor,
              type: 'city',
              lang: 'pt',
              limit: 5,
              filter: 'countrycode:br',
              format: 'json',
              apiKey: import.meta.env.VITE_GEOAPIFY_API_KEY
            }
          }
        )

        const locaisFormatados = (results ?? []).map(item => {
          const cidade = item.city || item.name
          const estado = item.state_code || item.state
          const pais = item.country

          return {
            ...item,
            formatted: `${cidade}, ${estado}, ${pais}`
          }
        })

        update(() => this.form_drawer.options_location = locaisFormatados)

      } catch {
        update(() => this.form_drawer.options_location = [])

        this.$q.notify({
          color: 'negative',
          message: 'Ocorreu um erro ao buscar a localização'
        })
      }
    },

    desmarcarEvento (event) {
      const data_formatada = this.formatarDataAgenda(event)

      const dialog = this.$q.dialog({
        component: defineAsyncComponent(() =>
          import('@/components/ModalConfirmacao.vue')
        ),

        componentProps: {
          titulo: 'Desmarcar',
          texto: `Tem certeza que deseja desmarcar a data ${data_formatada} ?`,
          btnLabelOk: 'Sim'
        }
      })

      dialog.onOk(() => this.$emit('desmarcar-evento', event))
    },

    excluirEvento () {
      const dialog = this.$q.dialog({
        component: defineAsyncComponent(
          () => import('@/components/ModalConfirmacao.vue')
        ),
        componentProps: {
          titulo: 'Excluir',
          texto: `Tem certeza de que deseja excluir o evento ${this.form_drawer.title}?`,
          btnLabelOk: 'Excluir'
        }
      })

      dialog?.onOk(() => this.$emit('excluir-evento', this.form_drawer))
    },

    async salvarEvento () {
      const form_valido = await this.$refs?.form?.validate()

      if (!form_valido) return

      const form_calendario = { ...this.form_drawer }

      delete form_calendario.options_location

      const emitter = this.novo_evento ? 'adicionar' : 'editar'

      this.$emit(`${emitter}-evento`, form_calendario)
    },

    fetchFormDrawer () {
      if (!this.novo_evento) {

        this.form_drawer = this.form_calendario

        return
      }

      this.form_drawer = {
        title: '',
        details: '',
        location: '',
        options_location: [],
        all_day: true,
        time_start: '10:00',
        time_end: '11:00'

      }
    }
  },


  mounted () {
    this.fetchFormDrawer()
  }
}
</script>
