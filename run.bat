@echo off
setlocal

call pnpm.cmd run deploy
if errorlevel 1 (
  echo Deploy failed. Bot was not started.
  exit /b 1
)

call pnpm.cmd start
