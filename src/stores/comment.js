import { defineStore } from "pinia";
import api from "@/api";
import { useAppStore } from "@/stores/app";

export const useCommentStore = defineStore("comment", {
  state: () => ({
    comments: [],
    status: "idle",
    message: "",
  }),
  getters: {},
  actions: {
    async fetchComments(postId) {
      const appStore = useAppStore();
      this.status = "loading";
      this.message = "";
      try {
        const response = await api.get(`/comments/post/${postId}`);
        this.comments = response.data;
        this.status = "success";
      } catch (error) {
        this.status = "error";
        this.message = error.response?.data?.message || "Yorumlar yüklenemedi.";
        appStore.apiError(error, "Yorumlar yüklenemedi.");
      }
    },
    async createComment({ postId, content, parentCommentId }) {
      const appStore = useAppStore();
      try {
        const response = await api.post("/comments", {
          postId,
          content,
          parentCommentId,
        });
        this.comments.unshift(response.data.comment);
        appStore.success(response.data.message || "Yorum eklendi.");
        return response.data.comment;
      } catch (error) {
        appStore.apiError(error, "Yorum gönderilemedi.");
        return null;
      }
    },
    async updateComment(commentId, content) {
      const appStore = useAppStore();
      try {
        const response = await api.put(`/comments/${commentId}`, { content });
        const index = this.comments.findIndex((c) => c._id === commentId);
        if (index !== -1) {
          this.comments[index] = { ...this.comments[index], content };
        }
        appStore.success(response.data.message || "Yorum güncellendi.");
        return true;
      } catch (error) {
        appStore.apiError(error, "Yorum güncellenemedi.");
        return false;
      }
    },
    async deleteComment(commentId) {
      const appStore = useAppStore();
      try {
        const response = await api.delete(`/comments/${commentId}`);
        this.comments = this.comments.filter(
          (c) => c._id !== commentId && c.parentCommentId !== commentId,
        );
        appStore.success(response.data.message || "Yorum silindi.");
        return true;
      } catch (error) {
        appStore.apiError(error, "Yorum silinemedi.");
        return false;
      }
    },
    async likeComment(commentId) {
      const appStore = useAppStore();
      try {
        await api.post(`/comments/${commentId}/like`);
        const comment = this.comments.find((c) => c._id === commentId);
        if (comment) {
          const userId = JSON.parse(localStorage.getItem("user"))?._id;
          const idx = comment.likes.indexOf(userId);
          if (idx !== -1) {
            comment.likes.splice(idx, 1);
          } else {
            comment.likes.push(userId);
          }
        }
      } catch (error) {
        appStore.apiError(error, "Beğeni işlemi başarısız.");
      }
    },
  },
});
