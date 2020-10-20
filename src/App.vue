<template>
  <div id="app">
    <LoginPage v-if="applyLoginPage" author="Juraj Piovar"/>
    <MainPage v-if="applyMainPage"/>
    <Loader v-if="modeStatus==='loading'"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { namespace } from 'vuex-class';
import LoginPage from './components/pages/loginPage/LoginPage.vue';
import MainPage from './components/pages/mainPage/MainPage.vue';
import Loader from './components/common/loader/Loader.vue';
import { USER, PAGES, MODE } from './stores/constants';
import { USER_STATUS_OUT, USER_STATUS_IN, USER_STATUS_INITIAL } from './stores/user/constants';
import { AppMode, Reference } from '@/stores/mode/mode.types';
import {
  MODE_INITIAL,
  MODE_LOADING,
  MODE_LOADED,
  REFERENCE_INITIAL
} from '@/stores/mode/constants';
// import HelloWorld from './components/HelloWorld.vue';

const UserStore = namespace(USER);
const PagesStore = namespace(PAGES);
const ModeStore = namespace(MODE);

@Component({
  components: {
    // HelloWorld,
    LoginPage,
    MainPage,
    Loader
  }
})
export default class App extends Vue {
  @UserStore.Getter userStatus: any;

  @PagesStore.Action storePagesData!: () => Promise<any>;

  @ModeStore.Getter modeStatus: any;

  @ModeStore.Action setMode!:
    ({ reference, status }: { reference: Reference, status: AppMode }) => void;

  userStatusInitial = USER_STATUS_INITIAL;

  userStatusIn = USER_STATUS_IN;

  userStatusOut = USER_STATUS_OUT;

  created() {
    // console.log('version 20.11.2019 12.58');
    // console.log(process.env.VUE_APP_TITLE, ' ', process.env.VUE_APP_AUTHOR);
    let status = MODE_LOADING;
    const reference = REFERENCE_INITIAL;
    this.setMode({ reference, status });
    this.storePagesData().then((response: any) => {
      // something next if needed
    }).finally(() => {
      status = MODE_LOADED;
      this.setMode({ reference, status });
    });
  }

  get applyLoginPage(): Boolean {
    return this.userStatus === this.userStatusInitial || this.userStatus === this.userStatusOut;
  }

  get applyMainPage(): Boolean {
    return this.userStatus === this.userStatusIn;
  }
}
</script>

<style lang="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 40px;
}
</style>
