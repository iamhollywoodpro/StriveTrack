import { onRequestGet as __api_media_file__id__js_onRequestGet } from "/home/user/webapp/functions/api/media/file/[id].js"
import { onRequestPost as __api_achievements_check_js_onRequestPost } from "/home/user/webapp/functions/api/achievements/check.js"
import { onRequestGet as __api_admin_media_js_onRequestGet } from "/home/user/webapp/functions/api/admin/media.js"
import { onRequestPost as __api_admin_media_js_onRequestPost } from "/home/user/webapp/functions/api/admin/media.js"
import { onRequestDelete as __api_admin_users_js_onRequestDelete } from "/home/user/webapp/functions/api/admin/users.js"
import { onRequestGet as __api_admin_users_js_onRequestGet } from "/home/user/webapp/functions/api/admin/users.js"
import { onRequestPost as __api_auth_login_js_onRequestPost } from "/home/user/webapp/functions/api/auth/login.js"
import { onRequestPost as __api_auth_logout_js_onRequestPost } from "/home/user/webapp/functions/api/auth/logout.js"
import { onRequestPost as __api_auth_register_js_onRequestPost } from "/home/user/webapp/functions/api/auth/register.js"
import { onRequestGet as __api_auth_validate_session_js_onRequestGet } from "/home/user/webapp/functions/api/auth/validate-session.js"
import { onRequestGet as __api_challenges_daily_js_onRequestGet } from "/home/user/webapp/functions/api/challenges/daily.js"
import { onRequestPost as __api_habits_complete_js_onRequestPost } from "/home/user/webapp/functions/api/habits/complete.js"
import { onRequestGet as __api_habits_weekly_js_onRequestGet } from "/home/user/webapp/functions/api/habits/weekly.js"
import { onRequestPost as __api_habits_weekly_js_onRequestPost } from "/home/user/webapp/functions/api/habits/weekly.js"
import { onRequestGet as __api_media_videos_js_onRequestGet } from "/home/user/webapp/functions/api/media/videos.js"
import { onRequestPost as __api_media_videos_js_onRequestPost } from "/home/user/webapp/functions/api/media/videos.js"
import { onRequestDelete as __api_habits__id__js_onRequestDelete } from "/home/user/webapp/functions/api/habits/[id].js"
import { onRequestGet as __api_achievements_index_js_onRequestGet } from "/home/user/webapp/functions/api/achievements/index.js"
import { onRequestPost as __api_achievements_index_js_onRequestPost } from "/home/user/webapp/functions/api/achievements/index.js"
import { onRequestGet as __api_friends_index_js_onRequestGet } from "/home/user/webapp/functions/api/friends/index.js"
import { onRequestPost as __api_friends_index_js_onRequestPost } from "/home/user/webapp/functions/api/friends/index.js"
import { onRequestGet as __api_habits_index_js_onRequestGet } from "/home/user/webapp/functions/api/habits/index.js"
import { onRequestPost as __api_habits_index_js_onRequestPost } from "/home/user/webapp/functions/api/habits/index.js"
import { onRequestGet as __api_leaderboards_index_js_onRequestGet } from "/home/user/webapp/functions/api/leaderboards/index.js"
import { onRequestGet as __api_media_index_js_onRequestGet } from "/home/user/webapp/functions/api/media/index.js"
import { onRequestPost as __api_media_index_js_onRequestPost } from "/home/user/webapp/functions/api/media/index.js"
import { onRequestGet as __api_nutrition_index_js_onRequestGet } from "/home/user/webapp/functions/api/nutrition/index.js"
import { onRequestPost as __api_nutrition_index_js_onRequestPost } from "/home/user/webapp/functions/api/nutrition/index.js"
import { onRequest as ___middleware_js_onRequest } from "/home/user/webapp/functions/_middleware.js"

export const routes = [
    {
      routePath: "/api/media/file/:id",
      mountPath: "/api/media/file",
      method: "GET",
      middlewares: [],
      modules: [__api_media_file__id__js_onRequestGet],
    },
  {
      routePath: "/api/achievements/check",
      mountPath: "/api/achievements",
      method: "POST",
      middlewares: [],
      modules: [__api_achievements_check_js_onRequestPost],
    },
  {
      routePath: "/api/admin/media",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_media_js_onRequestGet],
    },
  {
      routePath: "/api/admin/media",
      mountPath: "/api/admin",
      method: "POST",
      middlewares: [],
      modules: [__api_admin_media_js_onRequestPost],
    },
  {
      routePath: "/api/admin/users",
      mountPath: "/api/admin",
      method: "DELETE",
      middlewares: [],
      modules: [__api_admin_users_js_onRequestDelete],
    },
  {
      routePath: "/api/admin/users",
      mountPath: "/api/admin",
      method: "GET",
      middlewares: [],
      modules: [__api_admin_users_js_onRequestGet],
    },
  {
      routePath: "/api/auth/login",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_login_js_onRequestPost],
    },
  {
      routePath: "/api/auth/logout",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_logout_js_onRequestPost],
    },
  {
      routePath: "/api/auth/register",
      mountPath: "/api/auth",
      method: "POST",
      middlewares: [],
      modules: [__api_auth_register_js_onRequestPost],
    },
  {
      routePath: "/api/auth/validate-session",
      mountPath: "/api/auth",
      method: "GET",
      middlewares: [],
      modules: [__api_auth_validate_session_js_onRequestGet],
    },
  {
      routePath: "/api/challenges/daily",
      mountPath: "/api/challenges",
      method: "GET",
      middlewares: [],
      modules: [__api_challenges_daily_js_onRequestGet],
    },
  {
      routePath: "/api/habits/complete",
      mountPath: "/api/habits",
      method: "POST",
      middlewares: [],
      modules: [__api_habits_complete_js_onRequestPost],
    },
  {
      routePath: "/api/habits/weekly",
      mountPath: "/api/habits",
      method: "GET",
      middlewares: [],
      modules: [__api_habits_weekly_js_onRequestGet],
    },
  {
      routePath: "/api/habits/weekly",
      mountPath: "/api/habits",
      method: "POST",
      middlewares: [],
      modules: [__api_habits_weekly_js_onRequestPost],
    },
  {
      routePath: "/api/media/videos",
      mountPath: "/api/media",
      method: "GET",
      middlewares: [],
      modules: [__api_media_videos_js_onRequestGet],
    },
  {
      routePath: "/api/media/videos",
      mountPath: "/api/media",
      method: "POST",
      middlewares: [],
      modules: [__api_media_videos_js_onRequestPost],
    },
  {
      routePath: "/api/habits/:id",
      mountPath: "/api/habits",
      method: "DELETE",
      middlewares: [],
      modules: [__api_habits__id__js_onRequestDelete],
    },
  {
      routePath: "/api/achievements",
      mountPath: "/api/achievements",
      method: "GET",
      middlewares: [],
      modules: [__api_achievements_index_js_onRequestGet],
    },
  {
      routePath: "/api/achievements",
      mountPath: "/api/achievements",
      method: "POST",
      middlewares: [],
      modules: [__api_achievements_index_js_onRequestPost],
    },
  {
      routePath: "/api/friends",
      mountPath: "/api/friends",
      method: "GET",
      middlewares: [],
      modules: [__api_friends_index_js_onRequestGet],
    },
  {
      routePath: "/api/friends",
      mountPath: "/api/friends",
      method: "POST",
      middlewares: [],
      modules: [__api_friends_index_js_onRequestPost],
    },
  {
      routePath: "/api/habits",
      mountPath: "/api/habits",
      method: "GET",
      middlewares: [],
      modules: [__api_habits_index_js_onRequestGet],
    },
  {
      routePath: "/api/habits",
      mountPath: "/api/habits",
      method: "POST",
      middlewares: [],
      modules: [__api_habits_index_js_onRequestPost],
    },
  {
      routePath: "/api/leaderboards",
      mountPath: "/api/leaderboards",
      method: "GET",
      middlewares: [],
      modules: [__api_leaderboards_index_js_onRequestGet],
    },
  {
      routePath: "/api/media",
      mountPath: "/api/media",
      method: "GET",
      middlewares: [],
      modules: [__api_media_index_js_onRequestGet],
    },
  {
      routePath: "/api/media",
      mountPath: "/api/media",
      method: "POST",
      middlewares: [],
      modules: [__api_media_index_js_onRequestPost],
    },
  {
      routePath: "/api/nutrition",
      mountPath: "/api/nutrition",
      method: "GET",
      middlewares: [],
      modules: [__api_nutrition_index_js_onRequestGet],
    },
  {
      routePath: "/api/nutrition",
      mountPath: "/api/nutrition",
      method: "POST",
      middlewares: [],
      modules: [__api_nutrition_index_js_onRequestPost],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_js_onRequest],
      modules: [],
    },
  ]