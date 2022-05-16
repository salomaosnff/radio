import { defineStore } from "pinia";

export const usePlaylist = defineStore({
  id: "playlist",
  state: () => ({
    items: [] as any[],
  }),
  actions: {
    push(item: File | string) {
      this.items.push({
        name: typeof item === "string" ? item : item.name,
        src: item,
      });
    },
    remove(index: number) {
      this.items.splice(index, 1);
    },

    next() {
      const item = this.items.shift();

      if (item) {
        this.items.push(item);
      }

      return item;
    },

    import(files: FileList) {
      for (let i = 0; i < files.length; i++) {
        this.push(files[i]);
      }
    },
  },
});
