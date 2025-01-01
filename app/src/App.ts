import { ref } from 'vue';

const session = ref<string | null>(null);

export default class App {
    static store = {
        session
    }
}