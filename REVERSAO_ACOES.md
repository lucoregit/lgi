# Guia de Reversão de Ações (Rollback)

Este documento descreve detalhadamente todas as alterações realizadas nesta sessão e fornece os passos e comandos exatos para reverter o projeto para o estado anterior, seja de forma modular ou completa.

---

## 📋 Resumo das Ações Realizadas nesta Sessão

1. **Repositório Git e Commits:**
   * O remote `origin` foi alterado de `https://github.com/lucasb4n/LGI.git` para `https://github.com/lucoregit/lgi.git`.
   * Foram adicionados 4 novos commits locais e enviados para o novo GitHub:
     * `5665daa`: *feat: atualizar projeto, adicionar agendamentos e limpar dependencias rastreadas*
     * `1e2562a`: *feat: configurar suporte a banco H2 embutido para apresentacao offline*
     * `7c44b43`: *feat: adicionar configuracao completa do Docker com compose e multi-stage builds*
     * `6c4eb87`: *feat: incluir icone, gerador automatico de atalho e mock data no repositorio*
   * Commit original antes das alterações: **`ea76fed`** (*feat: implement post deletion functionality with confirmation*).

2. **Banco de Dados:**
   * Adicionada a dependência do H2 em `backend/pom.xml`.
   * Criados perfis `application-h2.properties` e `application-mysql.properties`.
   * Perfil ativo configurado para `h2` em `application.properties`.
   * `DatabaseInitializer.java` e `seed.sql` ajustados para compatibilidade com H2 e MySQL.

3. **Docker e Inicializadores:**
   * Criados `backend/Dockerfile`, `frontend/Dockerfile`, `frontend/nginx.conf`, `docker-compose.yml`.
   * Criados scripts: `iniciar_docker.bat`, `parar_docker.bat`, `iniciar_docker.sh`, `parar_docker.sh`.
   * Criados `iniciar_lgi.bat`, `parar_lgi.bat`, `criar_atalho.vbs`, `icon.ico`.
   * Criado atalho na Área de Trabalho: `LGI - Iniciar Sistema.lnk`.
   * Criado arquivo portátil: `c:\Desenvolvimento\LGI\lgi-projeto.zip`.

---

## 🔄 Opções de Reversão

Você pode escolher reverter apenas partes específicas ou reverter tudo para o ponto zero.

---

### Opção 1: Voltar apenas o Banco de Dados para o MySQL (Recomendado pós-apresentação)

Se você quiser manter o código e os scripts, mas apenas voltar a conectar no seu MySQL local instalado:

1. Abra o arquivo [`backend/src/main/resources/application.properties`](file:///c:/Desenvolvimento/LGI/feira-/feira/backend/src/main/resources/application.properties).
2. Altere a linha 2:
   ```properties
   # De:
   spring.profiles.active=h2

   # Para:
   spring.profiles.active=mysql
   ```
3. Pronto! O Spring Boot voltará a conectar automaticamente na sua instância local do MySQL (`localhost:3306`) usando o banco `feira_db` e o usuário `root`.

---

### Opção 2: Voltar o Remote do Git para o repositório original (`lucasb4n/LGI`)

Para apontar novamente o repositório local para o GitHub original de onde ele veio:

```powershell
cd c:\Desenvolvimento\LGI\feira-\feira
git remote set-url origin https://github.com/lucasb4n/LGI.git
```

Para remover a configuração local de autor (`lucoregit`):
```powershell
git config --unset user.name
git config --unset user.email
```

---

### Opção 3: Reverter os Commits no Git para o estado original (`ea76fed`)

> [!WARNING]
> Este procedimento desfaz os commits feitos nesta sessão e restaura o histórico do Git para o commit original `ea76fed`.

* **Para voltar o histórico do Git mantendo os arquivos no disco (soft):**
  ```powershell
  cd c:\Desenvolvimento\LGI\feira-\feira
  git reset --soft ea76fed
  ```

* **Para voltar o histórico e descartar completamente as mudanças de commit (hard):**
  ```powershell
  cd c:\Desenvolvimento\LGI\feira-\feira
  git reset --hard ea76fed
  ```

---

### Opção 4: Remover arquivos e atalhos criados nesta sessão

Se desejar apagar os arquivos auxiliares, scripts e ícones gerados:

#### No PowerShell (Terminal):
```powershell
# 1. Remover atalho da Área de Trabalho
$desktopLnk = [Environment]::GetFolderPath('Desktop') + "\LGI - Iniciar Sistema.lnk"
if (Test-Path $desktopLnk) { Remove-Item $desktopLnk -Force }

# 2. Remover arquivos soltos na pasta feira-
Remove-Item -Path "c:\Desenvolvimento\LGI\feira-\iniciar_lgi.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Desenvolvimento\LGI\feira-\parar_lgi.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Desenvolvimento\LGI\feira-\iniciar_docker.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Desenvolvimento\LGI\feira-\parar_docker.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Desenvolvimento\LGI\feira-\icon.ico" -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Desenvolvimento\LGI\feira-\emblem_crop.png" -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Desenvolvimento\LGI\feira-\emblem_square.png" -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Desenvolvimento\LGI\feira-\full_logo.png" -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Desenvolvimento\LGI\feira-\LGI - Iniciar Sistema.lnk" -ErrorAction SilentlyContinue
Remove-Item -Path "c:\Desenvolvimento\LGI\lgi-projeto.zip" -ErrorAction SilentlyContinue

# 3. Remover arquivos Docker e scripts da pasta feira
cd c:\Desenvolvimento\LGI\feira-\feira
Remove-Item -Path "docker-compose.yml" -ErrorAction SilentlyContinue
Remove-Item -Path "iniciar_docker.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "parar_docker.bat" -ErrorAction SilentlyContinue
Remove-Item -Path "iniciar_docker.sh" -ErrorAction SilentlyContinue
Remove-Item -Path "parar_docker.sh" -ErrorAction SilentlyContinue
Remove-Item -Path "criar_atalho.vbs" -ErrorAction SilentlyContinue
Remove-Item -Path "icon.ico" -ErrorAction SilentlyContinue
Remove-Item -Path "backend\Dockerfile" -ErrorAction SilentlyContinue
Remove-Item -Path "backend\.dockerignore" -ErrorAction SilentlyContinue
Remove-Item -Path "backend\data" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "frontend\Dockerfile" -ErrorAction SilentlyContinue
Remove-Item -Path "frontend\.dockerignore" -ErrorAction SilentlyContinue
Remove-Item -Path "frontend\nginx.conf" -ErrorAction SilentlyContinue
```

---

### Opção 5: Script Único de Reversão Automática (`reverter_tudo.bat`)

Se você quiser reverter **absolutamente tudo** com um único clique de volta para o ponto inicial de antes desta conversa:

Basta criar e executar um arquivo chamado `reverter_tudo.bat` com o conteúdo abaixo:

```cmd
@echo off
title Reversão Completa LGI
chcp 65001 > nul
echo ====================================================
echo         REVERTENDO TODAS AS ACOES DA SESSAO
echo ====================================================
echo.

:: 1. Remover Atalho do Desktop
del /f /q "%USERPROFILE%\Desktop\LGI - Iniciar Sistema.lnk" > nul 2>&1

:: 2. Remover Arquivos Gerados na pasta feira-
cd /d "c:\Desenvolvimento\LGI\feira-"
del /f /q "iniciar_lgi.bat" "parar_lgi.bat" "iniciar_docker.bat" "parar_docker.bat" "icon.ico" "emblem_*.png" "full_logo.png" "*.lnk" > nul 2>&1
del /f /q "c:\Desenvolvimento\LGI\lgi-projeto.zip" > nul 2>&1

:: 3. Remover Docker e Scripts de feira
cd /d "c:\Desenvolvimento\LGI\feira-\feira"
del /f /q "docker-compose.yml" "iniciar_docker.*" "parar_docker.*" "criar_atalho.vbs" "icon.ico" > nul 2>&1
del /f /q "backend\Dockerfile" "backend\.dockerignore" > nul 2>&1
del /f /q "frontend\Dockerfile" "frontend\.dockerignore" "frontend\nginx.conf" > nul 2>&1
rmdir /s /q "backend\data" > nul 2>&1

:: 4. Restaurar Git para o commit inicial ea76fed
git reset --hard ea76fed
git remote set-url origin https://github.com/lucasb4n/LGI.git
git config --unset user.name
git config --unset user.email

echo.
echo ====================================================
echo  [OK] Reversao completa concluida com sucesso!
echo ====================================================
pause
```
