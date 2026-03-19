import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";

export const usePostStore = defineStore("post",{
    state:()=>({
        posts:[],
        currentPost:null,
        status:"idle",
        message:"",
        pagination:{
            currentPage:1,
            totalPages:0,
            totalPosts:0,
            limit:10,
        },
    }),
    getters:{},
    actions:{
        async getPostByUserId(userId, { page = 1, limit = 10 } = {}){
            const appStore = useAppStore();
            this.status = "loading";
            this.message = "";
            try {
                const response = await api.get(`/posts/user/${userId}`, {
                    params: { page, limit }
                });
                this.posts = response.data.posts;
                this.pagination = response.data.pagination;
                this.status = "success";
                
            } catch (error) {
                this.status = "error";
                this.message = error.response?.data?.message || "Gönderiler yüklenemedi.";
                appStore.error(this.message);
            }
        }
    }
})