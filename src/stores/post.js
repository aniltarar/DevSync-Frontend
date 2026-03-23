import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";
import { buildQuery } from "@/utils/buildQuery";

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
        async fetchPosts({ page = 1, limit = 10, author, tag, sortBy, append = false } = {}) {
            const appStore = useAppStore();
            this.status = "loading";
            this.message = "";
            try {
                const params = buildQuery({ page, limit, author, tag, sortBy });
                const response = await api.get("/posts", { params });
                if (append) {
                    this.posts.push(...response.data.posts);
                } else {
                    this.posts = response.data.posts;
                }
                this.pagination = response.data.pagination;
                this.status = "success";
            } catch (error) {
                this.status = "error";
                this.message = error.response?.data?.message || "Gönderiler yüklenemedi.";
                appStore.error(this.message);
            }
        },
        async getPostById(postId) {
            const appStore = useAppStore();
            this.status = "loading";
            this.message = "";
            try {
                const response = await api.get(`/posts/${postId}`);
                this.currentPost = response.data.post;
                this.status = "success";
            } catch (error) {
                this.status = "error";
                this.message = error.response?.data?.message || "Gönderi yüklenemedi.";
                appStore.error(this.message);
            }
        },
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
        },
        async createPost({ content, tags, images }) {
            const appStore = useAppStore();
            this.status = "loading";
            this.message = "";
            try {
                const formData = new FormData();
                formData.append("content", content);
                if (tags?.length) {
                    tags.forEach((tag) => formData.append("tags[]", tag));
                }
                if (images?.length) {
                    images.forEach((file) => formData.append("images", file));
                }
                const response = await api.post("/posts", formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                this.posts.unshift(response.data.post);
                this.status = "success";
                appStore.success(response.data.message || "Gönderi oluşturuldu.");
                return true;
            } catch (error) {
                this.status = "error";
                this.message = error.response?.data?.message || "Gönderi oluşturulamadı.";
                appStore.error(this.message);
                return false;
            }
        },
        async updatePost(postId, { content, tags, removedImageUrls, newImages }) {
            const appStore = useAppStore();
            this.status = "loading";
            try {
                const formData = new FormData();
                if (content) formData.append("content", content);
                if (tags?.length) {
                    tags.forEach((tag) => formData.append("tags[]", tag));
                }
                if (removedImageUrls?.length) {
                    removedImageUrls.forEach((url) => formData.append("removedImageUrls[]", url));
                }
                if (newImages?.length) {
                    newImages.forEach((file) => formData.append("images", file));
                }
                const response = await api.put(`/posts/${postId}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
                const index = this.posts.findIndex((p) => p._id === postId);
                if (index !== -1) {
                    this.posts[index] = { ...this.posts[index], ...response.data.post };
                }
                this.status = "success";
                appStore.success(response.data.message || "Gönderi güncellendi.");
                return true;
            } catch (error) {
                this.status = "error";
                appStore.error(error.response?.data?.message || "Gönderi güncellenemedi.");
                return false;
            }
        },
        async deletePost(postId) {
            const appStore = useAppStore();
            this.status = "loading";
            try {
                const response = await api.delete(`/posts/${postId}`);
                this.posts = this.posts.filter((p) => p._id !== postId);
                if (this.currentPost?._id === postId) {
                    this.currentPost = null;
                }
                this.status = "success";
                appStore.success(response.data.message || "Gönderi silindi.");
                return true;
            } catch (error) {
                this.status = "error";
                appStore.error(error.response?.data?.message || "Gönderi silinemedi.");
                return false;
            }
        },
        async likePost(postId) {
            try {
                const response = await api.post(`/posts/${postId}/like`);
                const post = this.posts.find((p) => p._id === postId);
                if (post) {
                    const userId = JSON.parse(localStorage.getItem("user"))?._id;
                    const likes = [...post.engagement.likes];
                    const idx = likes.indexOf(userId);
                    if (idx !== -1) {
                        likes.splice(idx, 1);
                    } else {
                        likes.push(userId);
                    }
                    post.engagement = { ...post.engagement, likes };
                }
                // Also update currentPost if viewing detail
                if (this.currentPost?._id === postId) {
                    const userId = JSON.parse(localStorage.getItem("user"))?._id;
                    const likes = [...this.currentPost.engagement.likes];
                    const idx = likes.indexOf(userId);
                    if (idx !== -1) {
                        likes.splice(idx, 1);
                    } else {
                        likes.push(userId);
                    }
                    this.currentPost = { ...this.currentPost, engagement: { ...this.currentPost.engagement, likes } };
                }
                return response.data;
            } catch (error) {
                const appStore = useAppStore();
                appStore.error(error.response?.data?.message || "Beğeni işlemi başarısız.");
            }
        },
    }
})