import axios from "@/utils/axios";

const affiliateApi = {
  getStats: () =>
    axios.get("/admin/affiliates/stats"),

  getAffiliates: (params?: Record<string, any>) =>
    axios.get("/admin/affiliates", { params }),

  getAffiliate: (id: number | string) =>
    axios.get(`/admin/affiliates/${id}`),

  updateAffiliateStatus: (id: number | string, status: string) =>
    axios.patch(`/admin/affiliates/${id}/status`, { status }),

  getReferrals: (params?: Record<string, any>) =>
    axios.get("/admin/referrals", { params }),

  getReferral: (id: number | string) =>
    axios.get(`/admin/referrals/${id}`),

  getCommissions: (params?: Record<string, any>) =>
    axios.get("/admin/commissions", { params }),

  getCommission: (id: number | string) =>
    axios.get(`/admin/commissions/${id}`),

  approveCommission: (id: number | string) =>
    axios.post(`/admin/commissions/${id}/approve`),

  rejectCommission: (id: number | string, reason?: string) =>
    axios.post(`/admin/commissions/${id}/reject`, { reason }),

  payCommission: (id: number | string) =>
    axios.post(`/admin/commissions/${id}/pay`),

  getPayments: (params?: Record<string, any>) =>
    axios.get("/admin/affiliate-payments", { params }),
};

export default affiliateApi;
