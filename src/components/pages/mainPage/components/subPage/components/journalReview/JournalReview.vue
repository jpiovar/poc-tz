<template>
  <div :id="idComponent" class="subcategory">
    <p class="title">{{title}}</p>
    <p class="text">{{text}}</p>
    <p class="search-dropdown" id="kmat">
      <label>KMAT</label>
      <multiselect
      v-model="valueKmat" :options="optionsKmat"
      :custom-label="customSelectKmat"
      placeholder=""
      label="title" track-by="title"
      :show-labels="false"
      :allow-empty="false"
      @select="onChangeMultiselect($event, 'kmat')">
      </multiselect>
    </p>
    <p class="search-dropdown" id="mvm1">
      <label>MVM1</label>
      <multiselect
      v-model="valueMvm1" :options="optionsMvm1"
      :custom-label="customSelectMvm1"
      placeholder=""
      label="title" track-by="title"
      :show-labels="false"
      :allow-empty="false"
      @select="onChangeMultiselect($event, 'mvm1')">
      </multiselect>
    </p>
    <p class="search-dropdown" id="mvm2">
      <label>MVM2</label>
      <multiselect
      v-model="valueMvm2" :options="optionsMvm2"
      :custom-label="customSelectMvm2"
      placeholder=""
      label="title" track-by="title"
      :show-labels="false"
      :allow-empty="false"
      @select="onChangeMultiselect($event, 'mvm2')">
      </multiselect>
    </p>
    <div class="confirm-btn">
      <span><button type="button" class="btn btn-primary" @click="confirmFilter">Potvrd</button> {{limitInfo}}</span>
    </div>
    <p class="table container">
      <table class="table table-hover">
        <thead>
          <tr>
          <th>KMAT</th>
          <th>MNOZSTVI</th>
          <th>HMOTNOST</th>
          <th>MVM1</th>
          <th>MVM2</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in itemsJournalFiltered" :key="item._id" :id="item._id" :index="index">
            <td>{{item.kmat}}</td>
            <td>{{item.mnozstvi}}</td>
            <td>{{item.hmotnost}}</td>
            <td>{{item.mvm1}}</td>
            <td>{{item.mvm2}}</td>
          </tr>
        </tbody>
      </table>
    </p>
    <message
      :executed="message.executed"
      :type="message.type"
      :text="message.text"
      :visibilityMessageRef="visibilityMessage"
      v-if="message.show"
    />
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import _ from 'lodash';
import Multiselect from 'vue-multiselect';
import { namespace } from 'vuex-class';
import { PAGES, MODE, USER } from '@/stores/constants';
import { Page, Subpage } from '@/stores/pages/pages.types';
import { GeneralHelper } from '@/helpers/general.helper';
import { HttpMockService, HttpService } from '@/services/http.service';
import { Reference, AppMode } from '@/stores/mode/mode.types';
import { MODE_LOADING, REFERENCE_INITIAL, MODE_LOADED } from '@/stores/mode/constants';
import Message from '@/components/common/message/Message.vue';

const PagesStore = namespace(PAGES);
const ModeStore = namespace(MODE);
const UserStore = namespace(USER);
const generalHelper = new GeneralHelper();
const httpService = new HttpService();
const httpMockService = new HttpMockService();

const journalBaseUrl = process.env.VUE_APP_JOURNAL_URL;
const journalBaseUrlLocal = process.env.VUE_APP_JOURNAL_URL_LOCAL;
const journalFiltersUrl = process.env.VUE_APP_JOURNAL_FILTERS_URL;
const journalFiltersUrlLocal = process.env.VUE_APP_JOURNAL_FILTERS_URL_LOCAL;
const limit = process.env.VUE_APP_JOURNAL_LIMIT;

@Component({
  components: {
    Multiselect,
    Message
  },
  props: {
    title: {
      required: true,
      type: String
    },
    text: {
      required: true,
      type: String
    }
  }
})
export default class JournalReview extends Vue {
  idComponent: string = 'journalReview';

  valueKmat: any = null;

  valueMvm1: any = null;

  valueMvm2: any = null;

  optionsKmat: any = [];

  optionsMvm1: any = [];

  optionsMvm2: any = [];

  itemsJournal: any = [];

  itemsJournalFiltered: any = [];

  itemsJournalFilteredKmat: any = [];

  itemsJournalFilteredMvm1: any = [];

  itemsJournalFilteredMvm2: any = [];

  @PagesStore.Getter currentPageSubpage!: Subpage;

  @PagesStore.Getter currentPage!: Page;

  @ModeStore.Action setMode!:
    ({ reference, status }: { reference: Reference, status: AppMode }) => void;

  @UserStore.Getter accessToken: any;

  message: { type: string, text: string, executed: boolean, show: boolean } = {
    type: '',
    text: '',
    executed: false,
    show: false
  };

  created() {
    this.loadJournalFilterItems();

    // this.value = { title: 'Material0', desc: 'Balik nicoho' };

    // this.options = [
    //   { title: 'Material1', desc: 'Balik klincov' },
    //   { title: 'Material2', desc: 'Balik skrutiek' },
    //   { title: 'Material3', desc: 'Balik tesneni' },
    //   { title: 'Material4', desc: 'Balik podloziek' }
    // ];
  }

  onChangeMultiselect(event: any, id: any) {
    if (id === 'kmat') {
      this.valueKmat = event;
    } else if (id === 'mvm1') {
      this.valueMvm1 = event;
    } else if (id === 'mvm2') {
      this.valueMvm2 = event;
    }
  }

  confirmFilter() {
    this.loadJournalItems();
  }

  customSelectKmat({ title }: { title: string }): string {
    return title ? `${title}` : '';
  }

  customSelectMvm1({ title }: { title: string }): string {
    return title ? `${title}` : '';
  }

  customSelectMvm2({ title }: { title: string }): string {
    return title ? `${title}` : '';
  }

  get currentSubpageTitle(): String {
    return generalHelper.pickDeep(this.currentPageSubpage, ['content', 'title'], '');
  }

  get limitInfo(): String {
    return `current limit: ${limit} items`;
  }

  loadJournalFilterItems() {
    this.optionsKmat.push({ title: '' });
    this.optionsMvm1.push({ title: '' });
    this.optionsMvm2.push({ title: '' });

    // const headers = { 'Content-Type': 'text/plain;charset=UTF-8', 'ibm-sec-token': this.accessToken };
    httpService.getDirect(journalFiltersUrl).then((response) => {
      const resData = response.data;
      Object.keys(resData).forEach((key) => {
        for (let i = 0; i < resData[key].length; i++) {
          if (key === 'kmat') {
            this.optionsKmat.push({ title: resData[key][i] });
          } else if (key === 'mvm1') {
            this.optionsMvm1.push({ title: resData[key][i] });
          } else if (key === 'mvm2') {
            this.optionsMvm2.push({ title: resData[key][i] });
          }
        }
      });
    }).finally(() => {
      this.optionsKmat = _.orderBy(_.uniqBy(this.optionsKmat, 'title'), ['title'], ['asc']);
      this.optionsMvm1 = _.orderBy(_.uniqBy(this.optionsMvm1, 'title'), ['title'], ['asc']);
      this.optionsMvm2 = _.orderBy(_.uniqBy(this.optionsMvm2, 'title'), ['title'], ['asc']);
      [this.valueKmat] = this.optionsKmat;
      [this.valueMvm1] = this.optionsMvm1;
      [this.valueMvm2] = this.optionsMvm2;
    });
  }

  get generateUrl(): string {
    let queryString = '';
    if (this.valueKmat && this.valueKmat.title) {
      queryString = `${queryString}kmat=${this.valueKmat.title}&`;
    }
    if (this.valueMvm1 && this.valueMvm1.title) {
      queryString = `${queryString}mvm1=${this.valueMvm1.title}&`;
    }
    if (this.valueMvm2 && this.valueMvm2.title) {
      queryString = `${queryString}mvm2=${this.valueMvm2.title}&`;
    }
    queryString = `${queryString}limit=${limit}&`;
    if (queryString) {
      queryString = `?${queryString}`;
      queryString = queryString.slice(0, -1);
    }
    return `${journalBaseUrl}${queryString}`;
  }

  loadJournalItems() {
    this.setMode({ reference: REFERENCE_INITIAL, status: MODE_LOADING });
    // const headers = { 'Content-Type': 'text/plain;charset=UTF-8', 'ibm-sec-token': this.accessToken };
    httpService.getDirect(this.generateUrl).then((response) => {
    // httpMockService.getMockJournalDelay().then((response) => {
      this.messageBoxShow('success');
      this.itemsJournalFiltered = response.data;
    }, (error) => {
      this.messageBoxShow('error');
      // console.log('error ', error);
    }).finally(() => {
      this.setMode({ reference: REFERENCE_INITIAL, status: MODE_LOADED });
      this.messageBoxHide();
    });
  }

  messageBoxShow(type: string) {
    if (type === 'success') {
      this.message.executed = !this.message.executed;
      this.message.text = 'Query executed successfully';
      this.message.type = 'alert-success';
      this.message.show = true;
    } else if (type === 'error') {
      this.message.executed = !this.message.executed;
      this.message.text = 'Query failed';
      this.message.type = 'alert-danger';
      this.message.show = true;
    }
  }

  messageBoxHide() {
    this.message.executed = !this.message.executed;
  }


  visibilityMessage(obj: any) {
    this.message.show = obj.visibility;
  }
}
</script>

<style lang="scss" scoped>
.subcategory {
  .title, .text {
    margin: 10px;
  }
  .search-dropdown {
    margin: 10px;
    float: left;
    &#kmat, &#mvm1, &#mvm2{
      width: 140px;
    }
  }
  .table {
    float: left;
  }
  .confirm-btn {
    float: left;
    width: 250px;
    position: relative;
    height: 100px;
    span {
      position: absolute;
      bottom: 20px;
    }
  }
}
</style>
