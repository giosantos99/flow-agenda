<template>
<q-page v-if="!loading" class="page q-pa-sm">

  <template v-if="exibirCalendario">
    <q-toolbar
      class="bg-secondary text-white row items-center justify-between shadow-2 rounded-borders"
    >
      <q-btn
        icon="chevron_left"
        aria-label="Mês anterior"
        flat
        round
        dense
        @click="navMesCalendario('prev')"
      />

      <div class="row items-center text-h6 text-center text-weight-bold">
        <q-btn
          v-if="exibir_btn_mes_atual"
          class="q-mr-sm"
          icon="event_repeat"
          size="1.10rem"
          flat
          dense
          round
          @click="navMesCalendario('moveToToday')"
        >
          <q-tooltip v-if="!$q.screen.lt.md">Voltar para mês atual</q-tooltip>
        </q-btn>

        <span class="data-atual">{{ mesAtualCalendarioToolBar }}</span>
      </div>

      <q-btn
        icon="chevron_right"
        aria-label="Próximo mês"
        flat
        round
        dense
        @click="navMesCalendario('next')"
      />
    </q-toolbar>

    <div class="q-mt-sm">

      <QCalendarMonth
        v-model="data_calendario_selecionada"

        ref="calendar"
        locale="pt-BR"

        :focus-type="['day']"
        :selected-dates="data_selecionadas_calendario"
        :day-min-height="60"
        :day-height="120"

        no-active-date
        focusable
        bordered
        animated

        @click-date="selecionarDataCalendario"
        @click-day="selecionarDataCalendario"
      >
        <template #day="{ scope: { timestamp } }">
          <div
            v-if="filtrarEventos(timestamp.date)?.length"
            class="truncate-chip-labels q-gutter-xs row"
            style="max-width: 300px"
          >
            <q-chip
              :label="`${filtrarEventos(timestamp.date).length}
                ${
                  filtrarEventos(timestamp.date).length === 1
                    ? 'evento adicionado'
                    : 'eventos adicionados'
                }`"
              :dense="$q.screen.lt.md"
              icon="event"
              color="pink"
              text-color="white"
              class="text-weight-bold ellipsis"
              clickable
              @click.stop="exibirEventoSelecionado(timestamp)"
            >
              <q-tooltip v-if="!$q.screen.lt.md"
                >Clique para ver todos os eventos</q-tooltip
              >
            </q-chip>
          </div>
        </template>
      </QCalendarMonth>

    </div>

  </template>

  <template v-else>
    <q-toolbar
      class="bg-secondary text-white row items-center justify-between shadow-2 rounded-borders"
    >
      <q-btn
        icon="keyboard_return"
        aria-label="Voltar para calendário"
        flat
        round
        dense
        @click="
          eventos_selecionados_calendario = {};
          resetDrawerCalendario();
        "
      />

      <span class="text-h6 text-center">
        {{ eventos_selecionados_calendario.data_evento_descricao }}
      </span>

      <div></div>
    </q-toolbar>

    <div class="q-mt-sm">
      <q-calendar-day
        v-model="eventos_selecionados_calendario.date"

        ref="calendar"
        locale="pt-BR"
        view="day"

        :interval-minutes="60"
        :interval-start="0"
        :interval-count="24"
        :interval-height="120"

        column-header-after
        animated
        bordered
      >
        <template #column-header-after="{}">
          <div
            v-if="filtrarEventosSelecionados(true)?.length"
            class="column q-px-sm q-pt-md"
          >
            <div class="q-pb-sm">Eventos do dia todo</div>

            <div class="q-py-md q-gutter-x-sm">
              <q-card
                v-for="evento in filtrarEventosSelecionados(true)"
                :key="evento.id"
                class="card-evento q-mb-sm"
                @click="visualizarEvento(evento)"
              >
                <q-card-section
                  class="q-pa-sm cursor-pointer bg-pink text-white"
                >
                  {{ evento.title }}
                </q-card-section>
              </q-card>
            </div>
          </div>
        </template>

        <template #day-body="{ scope: { timeStartPos, timeDurationHeight } }">
          <template v-for="event in filtrarEventosSelecionados(false)" :key="event.id">
            <div
              class="calendar-day flex items-center cursor-pointer"
              :class="badgeClasses(event)"
              :style="
                badgeStyles(event, 'body', timeStartPos, timeDurationHeight)
              "
              @click="visualizarEvento(event)"
            >
              <div class="title q-calendar__ellipsis text-weight-bold">
                <span>
                  {{ event.time_start }} {{ !event.time_end ? ":" : "" }}
                </span>

                <span v-if="event.time_end"> - {{ event.time_end }}: </span>

                <span>{{ event.title }}</span>
              </div>
            </div>
          </template>
        </template>
      </q-calendar-day>
    </div>
  </template>

  <DrawerCalendario
    v-if="drawer?.open"
    v-bind="drawer"

    @adicionar-evento="adicionarEventoCalendario"
    @editar-evento="editarEvento"
    @excluir-evento="evt => { excluirEvento(evt.id); resetDrawerCalendario() }"
    @close-drawer="resetDrawerCalendario"
    @desmarcar-evento="desmarcarDataCalendario"
  />

</q-page>

<q-page v-else class="q-pa-sm">
  <q-toolbar
    class="bg-secondary text-white row items-center justify-between shadow-2 rounded-borders"
  >
    <q-skeleton type="circle" size="30px" />

    <q-skeleton type="text" width="180px" />

    <q-skeleton type="circle" size="30px" />
  </q-toolbar>

  <q-skeleton class="container q-mt-md" style="height: calc(100vh - 140px)" />
</q-page>
</template>

<script>
import { QCalendarDay, QCalendarMonth } from '@quasar/quasar-ui-qcalendar'
import '@quasar/quasar-ui-qcalendar/index.css'

import { DrawerCalendario } from '@/components'

import { defineAsyncComponent } from 'vue'

export default {
  name: 'IndexPage',

  components: {
    QCalendarDay,
    QCalendarMonth,
    DrawerCalendario,
  },

  data() {
    return {
      loading: false,
      exibir_btn_mes_atual: false,

      lista_eventos: [],
      data_selecionadas_calendario: [],

      data_calendario_selecionada: '',

      eventos_selecionados_calendario: {},
      drawer: {
        open: false,
        novo_evento: true,
        form_calendario: {}
      }
    }
  },

  computed: {

    exibirCalendario () {
      const eventos = this.eventos_selecionados_calendario?.eventos ?? []

      return !Object.keys(eventos)?.length
    },

    filtrarEventosSelecionados: {
      get () {
        return dia_todo => {
          const eventos = this.eventos_selecionados_calendario.eventos

          if (!eventos?.length) return

          return eventos.filter(({ all_day }) => all_day === dia_todo)
        }
      }
    },

    filtrarEventos: {
      get () {
        return dt => {
          if (!this.lista_eventos?.length) return []

          return this.lista_eventos
            .filter(({ date }) => date === dt)
        }
      }
    },

    mesAtualCalendarioToolBar () {
      if (!this.data_calendario_selecionada) return ''

      const [ano, mes, dia] = this.data_calendario_selecionada
        .split('-')
        .map(Number)

      const dataLocal = new Date(ano, mes - 1, dia)

      return new Intl.DateTimeFormat('pt-BR', {
        month: 'long',
        year: 'numeric'
      }).format(dataLocal)
    }
  },

  methods: {

    visualizarEvento (evento) {

      const dialog = this.$q.dialog({
        component: defineAsyncComponent(() =>
          import('@/components/ModalEvento.vue')
        ),
        componentProps: {
          evento
        }
      })

      dialog?.onOk((action) => {

        switch (action) {
          case 'excluir':
            this.excluirEvento(evento.id)

            break

          case 'editar':

            this.drawer = {
              open: true,
              novo_evento: false,
              form_calendario: { ...evento }
            }

            break
        }

      })
    },

    async editarEvento (evento) {
      try {
        this.$q.loading.show({ color: 'primary' })

        this.$q.notify({
          color: 'positive',
          message: 'Evento editado com sucesso'
        })

        const { id } = evento

        await this.$api.patch(`/eventos/${id}`, evento)

        this.eventos_selecionados_calendario.eventos = this.eventos_selecionados_calendario.eventos
          ?.map(item =>
            item.id === id
              ? evento
              : item
          )

        this.resetDrawerCalendario()
      } catch {
        this.$q.notify({
          color: 'negative',
          message: 'Ocorreu um erro ao tentar editar o evento'
        })
      } finally {
        this.$q.loading.hide()
      }
    },

    async excluirEvento (id) {
      try {
        this.$q.loading.show({ color: 'primary' })

        await this.$api.delete(`/eventos/${id}`)

        this.eventos_selecionados_calendario.eventos = this.eventos_selecionados_calendario.eventos
          ?.filter(({ id: idEvento }) => idEvento !== id)

        this.buscarTodosEventos()

        this.$q.notify({
          color: 'positive',
          message: 'Evento excluído com sucesso'
        })

      } catch {
        this.$q.notify({
          color: 'negative',
          message: 'Ocorreu um erro ao tentar excluir o evento'
        })
      } finally {
        this.$q.loading.hide()
      }
    },

    async exibirEventoSelecionado ({ date }) {
      try {
        this.$q.loading.show({ color: 'primary' })

        const { data } = await this.$api.get(`/eventos?date=${date}`)

        const [ano, mes, dia] = date.split('-').map(Number)
        const dataLocal = new Date(ano, mes - 1, dia)

        const options = {
          weekday: 'short',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        }

        const data_evento_descricao = Intl.DateTimeFormat(
          'pt-BR',
          options,
        ).format(dataLocal)

        this.eventos_selecionados_calendario = {
          date,
          data_evento_descricao,
          eventos: data ?? []
        }

        this.resetDrawerCalendario()
      } catch {
        this.$q.notify({
          color: 'negative',
          message: 'Ocorreu um erro ao carregar os eventos'
        })
      } finally {
        this.$q.loading.hide()
      }


    },

    async adicionarEventoCalendario (evento) {
      try {
        this.$q.loading.show({ color: 'primary' })

        await Promise.all(
          this.data_selecionadas_calendario?.map(date =>
            this.$api.post('/eventos', { ...evento, date })
          )
        )

        this.$q.notify({
          color: 'positive',
          message: 'Evento adicionado com sucesso'
        })

        this.buscarTodosEventos()
        this.resetDrawerCalendario()

      } catch {
        this.$q.notify({
          color: 'negative',
          message: 'Ocorreu um erro adicionar o evento'
        })
      } finally {
        this.$q.loading.hide()
      }
    },

    resetDrawerCalendario () {
      this.drawer = {
        open: false,
        novo_evento: true,
        form_calendario: {}
      }

      this.data_selecionadas_calendario = []
    },

    desmarcarDataCalendario (data) {
      this.data_selecionadas_calendario = this.data_selecionadas_calendario
        ?.filter(dt => dt !== data) ?? []

      this.drawer.form_calendario.events = this.data_selecionadas_calendario
      this.drawer.open = this.data_selecionadas_calendario?.length > 0
    },

    selecionarDataCalendario ({ scope }) {

      const { date } = scope.timestamp

      if (
        !this.data_selecionadas_calendario?.includes(date) &&
        !scope.outside
      ) {
        this.data_selecionadas_calendario?.push(date)

        this.drawer = {
          open: true,
          form_calendario: {
            events: this.data_selecionadas_calendario
          }
        }

        return
      }

      this.data_selecionadas_calendario = this.data_selecionadas_calendario
        ?.filter(dt => dt !== date)

      this.drawer = {
        open: this.data_selecionadas_calendario?.length > 0,
        novo_evento: true,
        form_calendario: {
          events: this.data_selecionadas_calendario
        }
      }
    },

    navMesCalendario (action) {
      this.$refs?.calendar?.[action]?.()
    },

    obterDataAtual () {

      const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
      const data = new Intl.DateTimeFormat('pt-BR', options).format(new Date())

      this.data_calendario_selecionada = data.split('/').reverse().join('-')
    },

    convertTimeToMinutes (timeStr) {
      if (!timeStr) return 0

      const [hours, minutes] = timeStr.split(":").map(Number)
      return hours * 60 + minutes
    },

    badgeStyles (event, type, timeStartPos, timeDurationHeight) {
      if (type !== 'body' || !event.time_start) return {}

      const startMinutes = this.convertTimeToMinutes(event.time_start)

      let endMinutes = event.time_end
        ? this.convertTimeToMinutes(event.time_end)
        : startMinutes + 60

      if (endMinutes <= startMinutes) endMinutes = startMinutes + 15
      const duration = endMinutes - startMinutes

      const visualDuration = Math.max(duration, 16)
      const visualEndMinutes = startMinutes + visualDuration

      const eventosDoDia = this.filtrarEventosSelecionados(false)

      const eventosColidindo = eventosDoDia.filter((e) => {
        const eStart = this.convertTimeToMinutes(e.time_start)
        let eEnd = e.time_end
          ? this.convertTimeToMinutes(e.time_end)
          : eStart + 60
        if (eEnd <= eStart) eEnd = eStart + 15

        const eVisualDuration = Math.max(eEnd - eStart, 16)
        const eVisualEndMinutes = eStart + eVisualDuration

        return startMinutes < eVisualEndMinutes && visualEndMinutes > eStart
      })

      eventosColidindo.sort((a, b) => {
        const startA = this.convertTimeToMinutes(a.time_start)
        const startB = this.convertTimeToMinutes(b.time_start)

        return startA - startB || String(a.id).localeCompare(String(b.id))
      })

      const totalColunas = eventosColidindo.length
      const indiceColuna = eventosColidindo.findIndex(({ id }) => id === event.id)

      const gap = 1
      const larguraPorColuna = (98 - gap * (totalColunas - 1)) / totalColunas
      const posicaoEsquerda = indiceColuna * (larguraPorColuna + gap)

      const intervalHeight = 120

      let top = timeStartPos(startMinutes)
      if (!top || top === undefined) top = (startMinutes / 60) * intervalHeight

      const calculatedHeight = timeDurationHeight(duration)
      const rawHeight = calculatedHeight > 0
          ? calculatedHeight
          : (duration / 60) * intervalHeight

      return {
        position: 'absolute',
        top: `${top}px`,
        height: `${rawHeight}px`,
        minHeight: '32px',
        width: `${larguraPorColuna}%`,
        left: `${posicaoEsquerda}%`
      }
    },

    badgeClasses () {
      return {
        'my-event': true,
        'bg-primary': true,
        'text-white': true,
        'rounded-borders': true,
        'q-pa-xs': true
      }
    },

    async buscarTodosEventos () {
      try {
        this.obterDataAtual()

        this.loading = true

        const { data } = await this.$api.get('/eventos')

        this.lista_eventos = data ?? []
      } catch {
        this.$q.notify({
          color: 'negative',
          message: 'Ocorreu um erro ao carregar os eventos',
        })
      } finally {
        this.loading = false
      }
    }
  },

  watch: {
    data_calendario_selecionada (nova_data) {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' }
      const data_atual = new Intl.DateTimeFormat('pt-BR', options).format(new Date())

      const mes_data_atual = data_atual.split('/')[1]
      const mes_data_atualizada = nova_data.split('-')[1]

      this.exibir_btn_mes_atual = mes_data_atual !== mes_data_atualizada
    }
  },

  mounted() {
    this.buscarTodosEventos()
  }
}
</script>

<style lang="sass" scoped>
.page
  height: calc(100vh - 50px)
  display: flex
  flex-direction: column

  .data-atual::first-letter
    text-transform: uppercase

  :deep(.q-calendar-month__day.q-selected)
    background: $pink
    color: $accent
    font-weight: bold

  :deep(.q-calendar-month__day.q-current-day)
    background: rgba(25, 118, 210, 0.15)
    border: 2px solid $primary
    border-radius: 4px
    transition: background-color 0.2s ease

  :deep(.q-calendar-month__day.q-current-day .q-calendar__button)
    margin-top: 4px
    border: 1px solid $primary
    background: $secondary
    color: $dark

  :deep(.q-calendar__ellipsis)
    text-transform: capitalize

  .calendar-day
    position: absolute
    border-radius: 4px
    padding: 2px 6px
    overflow: hidden
    box-sizing: border-box
    display: flex
    align-items: center
    text-overflow: ellipsis
    white-space: nowrap
    z-index: 2
    box-shadow: 0 1px 3px rgba(0,0,0,0.2)
    transition: all 0.2s ease

    .title
      font-size: 13px
      line-height: 1.2
      overflow: hidden
      text-overflow: ellipsis
      white-space: nowrap
      width: 100%

    &:hover
      z-index: 10
      filter: brightness(0.9)

  .card-evento
    &:hover
      transition: transform 0.3s ease, box-shadow 0.3s eas
      transform: translateY(-2px)
</style>
