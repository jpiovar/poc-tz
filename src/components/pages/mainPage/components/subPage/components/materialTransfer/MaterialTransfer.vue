<template>
  <div :id="idComponent" class="subcategory">
    <p class="title">{{title}}</p>
    <p class="text">{{text}}</p>
    <!-- <div class="search-dropdown update-input" id="kmat">
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
    </div> -->
    <div class="form-group update-input">
      <label for="kmat">KMAT</label>
      <input type="text" class="form-control" id="kmat" v-model="valueKmat">
    </div>
    <!-- <div class="search-dropdown update-input" id="mvm">
      <label>MVM</label>
      <multiselect
      v-model="valueMvm" :options="optionsMvm"
      :custom-label="customSelectMvm"
      placeholder=""
      label="title" track-by="title"
      :show-labels="false"
      :allow-empty="false"
      @select="onChangeMultiselect($event, 'mvm')">
      </multiselect>
    </div> -->
    <div class="form-group update-input">
      <label for="mvm">MVM</label>
      <input type="text" class="form-control" id="mvm" v-model="valueMvm">
    </div>
    <div class="form-group update-input">
      <label for="mnozstvi">MNOZSTVI</label>
      <input type="text" class="form-control" id="mnozstvi" v-model="valueMnozstvi">
    </div>
    <div class="form-group update-input">
      <label for="hmotnost">HMOTNOST</label>
      <input type="text" class="form-control" id="hmotnost" v-model="valueHmotnost">
    </div>
    <div class="confirm-btn">
      <span><button type="button" class="btn btn-primary" @click="confirmFilter">Potvrd</button> {{limitInfo}}</span>
    </div>
    <p class="table container">
      <table class="table table-hover">
        <thead>
          <tr>
          <th>KMAT</th>
          <th>MVM</th>
          <th>MNOZSTVI</th>
          <th>HMOTNOST</th>
          <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in itemsMaterialFiltered" :key="item.id" :id="item.rendered.id" :index="index"
          @mouseleave="itemClicked=null" class="input-item"
          @click="inputCopied(item, index); itemClicked=index">
            <td>
              <span>{{item.rendered.kmat}}</span>
            </td>
            <td>
              <span>{{item.rendered.mvm}}</span>
            </td>
            <td>
              <span>{{item.rendered.mnozstvi}}</span>
            </td>
            <td>
              <span>{{item.rendered.hmotnost}}</span>
            </td>
            <td>
              <!-- <span v-if="inputChanged(index, item)"> -->
              <!-- <span v-if="item.diff==='modified'">
                <i class="fa fa-arrow-circle-left" style="color:red" aria-hidden="true"></i> Modified
              </span>
              <span v-if="item.diff==='saved'">
                <i class="fa fa-check" style="color:green" aria-hidden="true"></i> Saved
              </span> -->
              <span v-if="itemClicked === index">
                <i class="fa fa-check" style="color:green" aria-hidden="true"></i> Copied
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </p>
    <div class="bottom-part">
      <div class="text-left title">Presun materialu</div>
      <p class="table container text-left">
        <table class="table table-hover">
          <thead>
            <tr>
            <th>KMAT</th>
            <th>MVM</th>
            <th>MNOZSTVI</th>
            <th>HMOTNOST</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in copiedItemsArr" :key="item.id" :id="item.id" :index="index"
            class="input-item">
              <td>
                <span>
                  <input type="text" class="form-control" v-model="item.kmat" readonly>
                </span>
              </td>
              <td>
                <span v-bind:class="{error: !item.mvmValid}">
                  <input type="text" class="form-control" v-model="item.mvm">
                  <span v-if="!item.mvmValid">Required any value</span>
                </span>
              </td>
              <td>
                <span v-bind:class="{error: (!item.mnozstviValid || !item.hmotnostValidDiff)}">
                  <input type="text" class="form-control" v-model="item.mnozstvi">
                  <span v-if="!item.mnozstviValid">Required whole number &gt; 0 and &lt;= original</span>
                  <span v-if="!item.mnozstviValidDiff">Required only one from pair "mnozstvi - hmotnost"</span>
                </span>
              </td>
              <td>
                <span v-bind:class="{error: (!item.hmotnostValid || !item.mnozstviValidDiff)}">
                  <input type="text" class="form-control" v-model="item.hmotnost">
                  <span v-if="!item.hmotnostValid">Required whole number &gt; 0 and &lt;= original</span>
                  <span v-if="!item.hmotnostValidDiff">Required only one from pair "mnozstvi - hmotnost"</span>
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </p>
      <span v-if="!hasNoCopiedItems(copiedItems)"><i class="fa fa-arrow-circle-right" style="color:red; margin-right: 10px; font-size: 20px;" aria-hidden="true"></i></span>
      <button type="button" class="btn btn-primary" @click="updateChangesAndStore" :disabled="hasNoCopiedItems(copiedItems)">Uloz zmeny</button>
    </div>
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
import {
  Component,
  Prop,
  Vue,
  Watch
} from 'vue-property-decorator';
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
const gh = new GeneralHelper();
const httpService = new HttpService();
const httpMockService = new HttpMockService();

const materialBaseUrl = process.env.VUE_APP_MATERIAL_URL;
const journalFiltersUrl = process.env.VUE_APP_JOURNAL_FILTERS_URL;
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
export default class materialTransfer extends Vue {
  idComponent: string = 'materialTransfer';

  valueKmat: any = null;

  valueMvm: any = null;

  valueMnozstvi: any = null;

  valueHmotnost: any = null;

  optionsKmat: any = [];

  optionsMvm: any = [];

  itemsMaterialFiltered: any = [];

  itemClicked: any = null;

  copiedItems: any = {};

  copiedItemsArr: any[] = [];

  itemCopiedBackup: any = {};

  @PagesStore.Getter currentPageSubpage!: Subpage;

  @PagesStore.Getter currentPage!: Page;

  @UserStore.Getter accessToken: any;

  @ModeStore.Action setMode!:
    ({ reference, status }: { reference: Reference, status: AppMode }) => void;

  message: { type: string, text: string, executed: boolean, show: boolean } = {
    type: '',
    text: '',
    executed: false,
    show: false
  };

  created() {
    this.loadMaterialFilterItems();

    // this.value = { title: 'Material0', desc: 'Balik nicoho' };

    // this.options = [
    //   { title: 'Material1', desc: 'Balik klincov' },
    //   { title: 'Material2', desc: 'Balik skrutiek' },
    //   { title: 'Material3', desc: 'Balik tesneni' },
    //   { title: 'Material4', desc: 'Balik podloziek' }
    // ];
  }

  hasNoCopiedItems(obj: any): Boolean {
    if (obj) {
      return _.keys(obj).length === 0;
    }
    return false;
  }

  // inputLeft(index: any, item: any) {
  //   if (item.rendered.kmat === '' || item.rendered.mvm === '' || item.rendered.mnozstvi === '' || item.rendered.hmotnost === '') {
  //     if (item.rendered.kmat === '') {
  //       item.rendered.kmat = item.original.kmat;
  //     } else if (item.rendered.mvm === '') {
  //       item.rendered.mvm = item.original.mvm;
  //     } else if (item.rendered.mnozstvi === '') {
  //       item.rendered.mnozstvi = item.original.mnozstvi;
  //     } else if (item.rendered.hmotnost === '') {
  //       item.rendered.hmotnost = item.original.hmotnost;
  //     }
  //     this.copiedItems[item.rendered.id] = gh.typeReset(gh.trimString(_.clone(item.rendered)), item.type);
  //   }
  // }

  // inputChanged(index: any, item: any) {
  //   if (item && !_.isEqual(item.rendered, item.original)) {
  //     item['diff'] = 'modified';
  //     this.copiedItems[item.rendered.id] = gh.typeReset(gh.trimString(_.clone(item.rendered)), item.type);
  //     item.rendered.kmat = item.rendered.kmat.trim();
  //     item.rendered.mvm = item.rendered.mvm.trim();
  //     item.rendered.mnozstvi = item.rendered.mnozstvi.trim();
  //     item.rendered.hmotnost = item.rendered.hmotnost.trim();
  //   } else {
  //     delete item.diff;
  //     delete this.copiedItems[item.rendered.id];
  //   }
  // }

  inputCopied(item: any, index: number) {
    debugger;
    this.copiedItems = {};
    this.copiedItems[item.rendered.id] = _.clone(item.rendered);
    this.addValidatorProps(this.copiedItems, item.rendered.id, index);
    this.copiedItemsArr = [..._.values(this.copiedItems)];
  }

  addValidatorProps(itemObj: any, id: any, index: number) {
    itemObj[id]['index'] = index;
    itemObj[id]['mvmValid'] = true;
    itemObj[id]['mnozstviValid'] = true;
    itemObj[id]['hmotnostValid'] = true;
    itemObj[id]['mnozstviValidDiff'] = true;
    itemObj[id]['hmotnostValidDiff'] = true;
  }

  updateChanges() {
    this.copiedItems = {};
  }

  updateChangesAndStore() {
    debugger;
    if (this.checkCopiedValues(this.copiedItemsArr)) {
      debugger;
      console.log('updateChangesAndStore done');
      // const dataObj = _.values(this.copiedItems);
      const dataObj = this.copiedItemsArr;
      this.setMode({ reference: REFERENCE_INITIAL, status: MODE_LOADING });
      // const headers = { 'Content-Type': 'text/plain;charset=UTF-8', 'ibm-sec-token': this.accessToken };
      httpService.putDirect(materialBaseUrl, dataObj).then((response) => {
        this.messageBoxShow('success');
        this.updateChanges();
      }, (error) => {
        this.messageBoxShow('error');
        console.log('error ', error);
      }).finally(() => {
        this.setMode({ reference: REFERENCE_INITIAL, status: MODE_LOADED });
        this.messageBoxHide();
      });
    }
  }

  onChangeMultiselect(event: any, id: any) {
    if (id === 'kmat') {
      this.valueKmat = event;
    } else if (id === 'mvm') {
      this.valueMvm = event;
    }
  }

  confirmFilter() {
    this.loadMaterialItems();
  }

  customSelectKmat({ title }: { title: string }): string {
    return title ? `${title}` : '';
  }

  customSelectMvm({ title }: { title: string }): string {
    return title ? `${title}` : '';
  }

  get currentSubpageTitle(): String {
    return gh.pickDeep(this.currentPageSubpage, ['content', 'title'], '');
  }

  get limitInfo(): String {
    return `current limit: ${limit} items`;
  }

  loadMaterialFilterItems() {
    this.optionsKmat.push({ title: '' });
    this.optionsMvm.push({ title: '' });

    httpService.getDirect(journalFiltersUrl).then((response) => {
      const resData = response.data;
      Object.keys(resData).forEach((key) => {
        for (let i = 0; i < resData[key].length; i++) {
          if (key === 'kmat') {
            this.optionsKmat.push({ title: resData[key][i] });
          } else if (key === 'mvm') {
            this.optionsMvm.push({ title: resData[key][i] });
          }
        }
      });
    }).finally(() => {
      this.optionsKmat = _.orderBy(_.uniqBy(this.optionsKmat, 'title'), ['title'], ['asc']);
      this.optionsMvm = _.orderBy(_.uniqBy(this.optionsMvm, 'title'), ['title'], ['asc']);
      // [this.valueKmat] = this.optionsKmat;
      this.valueKmat = '';
      // [this.valueMvm] = this.optionsMvm;
      this.valueMvm = '';
      this.valueMnozstvi = '';
      this.valueHmotnost = '';
    });
  }

  get generateUrl(): string {
    let queryString = '';
    // if (this.valueKmat && this.valueKmat.title) {
    //   queryString = `${queryString}kmat=${this.valueKmat.title}&`;
    // }
    if (this.valueKmat) {
      queryString = `${queryString}kmat=${this.valueKmat}&`;
    }
    // if (this.valueMvm && this.valueMvm.title) {
    //   queryString = `${queryString}mvm=${this.valueMvm.title}&`;
    // }
    if (this.valueMvm) {
      queryString = `${queryString}mvm=${this.valueMvm}&`;
    }
    if (this.valueMnozstvi) {
      queryString = `${queryString}mnozstvi=${this.valueMnozstvi}&`;
    }
    if (this.valueHmotnost) {
      queryString = `${queryString}hmotnost=${this.valueHmotnost}&`;
    }
    queryString = `${queryString}limit=${limit}&`;
    if (queryString) {
      queryString = `?${queryString}`;
      queryString = queryString.slice(0, -1);
    }
    return `${materialBaseUrl}${queryString}`;
  }

  loadMaterialItems() {
    debugger;
    this.setMode({ reference: REFERENCE_INITIAL, status: MODE_LOADING });
    // httpMockService.getMockDataTransferDelay().then((response: any) => {
    // const headers = { 'Content-Type': 'text/plain;charset=UTF-8', 'ibm-sec-token': this.accessToken };
    httpService.getDirect(this.generateUrl).then((response) => {
      debugger;
      // this.itemsMaterialFiltered = response;
      this.messageBoxShow('success');
      this.itemsMaterialFiltered = gh.renderedOriginal(response.data.materials);
    }, (error: any) => {
      this.messageBoxShow('error');
      console.log('error ', error);
    }).finally(() => {
      this.setMode({ reference: REFERENCE_INITIAL, status: MODE_LOADED });
      this.messageBoxHide();
      this.copiedItems = {};
    });
  }

  // itemBackupFill(item: any) {
  //   console.log('input in');
  //   this.itemCopiedBackup = _.clone(item);
  //   // this.itemCopiedBackup['mvmValid'] = false;
  // }

  // itemBackupClean() {
  //   console.log('input out');
  //   // this.itemCopiedBackup = {};
  // }

  checkCopiedValues(cItemsArr: any[]) {
    debugger;
    let res = 0;
    for (let i = 0; i < cItemsArr.length; i++) {
      // if (cItemsArr[i].mvm.trim() === this.itemsMaterialFiltered[cItemsArr[i].index].rendered.mvm) {
      if (cItemsArr[i].mvm.trim() !== '') {
        cItemsArr[i].mvmValid = true;
      } else {
        cItemsArr[i].mvmValid = false;
        res++;
      }
      if ((cItemsArr[i].mnozstvi.trim() !== '' && Number(cItemsArr[i].mnozstvi.trim()) > 0 && Number(cItemsArr[i].mnozstvi.trim()) <= this.itemsMaterialFiltered[cItemsArr[i].index].rendered.mnozstvi
        && cItemsArr[i].hmotnost === '')
        || (cItemsArr[i].hmotnost.trim() !== '' && Number(cItemsArr[i].hmotnost.trim()) > 0 && Number(cItemsArr[i].hmotnost.trim()) <= this.itemsMaterialFiltered[cItemsArr[i].index].rendered.hmotnost
        && cItemsArr[i].mnozstvi === '')) {
        cItemsArr[i].mnozstviValid = true;
        cItemsArr[i].hmotnostValid = true;
        cItemsArr[i].mnozstviValidDiff = true;
        cItemsArr[i].hmotnostValidDiff = true;
      } else if (cItemsArr[i].mnozstvi.trim() !== '' && (Number(cItemsArr[i].mnozstvi.trim()) <= 0 || Number(cItemsArr[i].mnozstvi.trim()) > this.itemsMaterialFiltered[cItemsArr[i].index].rendered.mnozstvi)
        && cItemsArr[i].hmotnost === '') {
        cItemsArr[i].mnozstviValid = false;
        cItemsArr[i].hmotnostValid = true;
        cItemsArr[i].mnozstviValidDiff = true;
        cItemsArr[i].hmotnostValidDiff = true;
        res++;
      } else if (cItemsArr[i].hmotnost.trim() !== '' && (Number(cItemsArr[i].hmotnost.trim()) <= 0 || Number(cItemsArr[i].hmotnost.trim()) > this.itemsMaterialFiltered[cItemsArr[i].index].rendered.hmotnost)
        && cItemsArr[i].mnozstvi === '') {
        cItemsArr[i].mnozstviValid = true;
        cItemsArr[i].hmotnostValid = false;
        cItemsArr[i].mnozstviValidDiff = true;
        cItemsArr[i].hmotnostValidDiff = true;
        res++;
      } else if (cItemsArr[i].hmotnost.trim() === '' && cItemsArr[i].mnozstvi.trim() === '') {
        cItemsArr[i].mnozstviValid = false;
        cItemsArr[i].hmotnostValid = false;
        res++;
      } else if ((cItemsArr[i].mnozstvi.trim() !== '' && Number(cItemsArr[i].mnozstvi.trim()) > 0 && Number(cItemsArr[i].mnozstvi.trim()) <= this.itemsMaterialFiltered[cItemsArr[i].index].rendered.mnozstvi)
      && (cItemsArr[i].hmotnost.trim() !== '' && Number(cItemsArr[i].hmotnost.trim()) > 0 && Number(cItemsArr[i].hmotnost.trim()) <= this.itemsMaterialFiltered[cItemsArr[i].index].rendered.hmotnost)) {
        cItemsArr[i].mnozstviValid = true;
        cItemsArr[i].hmotnostValid = true;
        cItemsArr[i].mnozstviValidDiff = false;
        cItemsArr[i].hmotnostValidDiff = false;
        res++;
      }
      // if (cItemsArr[i].mnozstvi === this.itemsMaterialFiltered[cItemsArr[i].index].rendered.mnozstvi) {
      //   cItemsArr[i].mnozstviValid = true;
      // } else {
      //   cItemsArr[i].mnozstviValid = false;
      //   res = false;
      // }
      // if (cItemsArr[i].hmotnost === this.itemsMaterialFiltered[cItemsArr[i].index].rendered.hmotnost) {
      //   cItemsArr[i].hmotnostValid = true;
      // } else {
      //   cItemsArr[i].hmotnostValid = false;
      //   res = false;
      // }
    }
    return res === 0;
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
  .update-input {
    margin: 10px;
    float: left;
    width: 80px;
    &#kmat, &#mvm {
      width: 130px;
    }
  }
  .input-item {
    td:nth-of-type(1), td:nth-of-type(2) {
      width: 160px;
    }
    td:nth-of-type(3), td:nth-of-type(4) {
      width: 80px;
    }
  }
  .search-dropdown {
    margin: 10px;
    float: left;
    &#kmat, &#mvm {
      width: 120px;
    }
  }
  .table {
    float: left;
    margin: 0;
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
  .bottom-part {
    float: left;
    position: relative;
    width: 100%;
    text-align: right;
    padding: 50px 10px;
    span {
      vertical-align: sub;
    }
    .title {
      font-size: 20px;
      font-weight: bold;
    }
  }
  .error {
    input {
      border:1px solid red;
    }
    span {
      color: red;
    }
  }
}
</style>
