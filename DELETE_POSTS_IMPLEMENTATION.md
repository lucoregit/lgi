# 🗑️ Implementação: Deleção de Posts

## 📋 Resumo Executivo

Implementação completa da funcionalidade de **deletar posts** no perfil do usuário. Quando você clica no menu de opções (⋮) de um post que é seu, aparece uma opção "🗑️ Deletar post" que remove o post e toda a sua cascata de dados (comentários, likes).

---

## 🔧 Alterações Backend

### 1. **CommentRepository.java**
```java
void deleteByPostId(Long postId);
```
- Método adicionado para deletar todos os comentários associados a um post

### 2. **LikeRepository.java**
```java
void deleteByPostId(Long postId);
```
- Método adicionado para deletar todos os likes associados a um post

### 3. **PostController.java** - Novo Endpoint
```java
@DeleteMapping("/{id}")
public ResponseEntity<?> deletePost(@PathVariable Long id, @RequestBody Map<String, String> body)
```

**Endpoint:** `DELETE /api/posts/{id}`

**Validações:**
- ✅ Valida se `userDocumento` é fornecido (400 Bad Request)
- ✅ Verifica se o usuário é o dono do post (403 Forbidden)
- ✅ Retorna 404 se post não existe

**Lógica de Deleção (cascata):**
1. Deleta todos comentários do post
2. Deleta todos likes do post
3. Deleta o post

**Resposta de Sucesso:**
```json
{
  "message": "Post deletado com sucesso"
}
```

---

## 🎨 Alterações Frontend

### 1. **PostCard.tsx**

**Mudanças:**
- Props agora inclui callback: `onPostDeleted?: (postId: number) => void`
- Verifica propriedade: `const isOwner = currentUser === post.userDocumento`
- Função `handleDeletePost()` que:
  - Pede confirmação antes de deletar
  - Faz chamada DELETE ao backend
  - Trata erros com mensagens apropriadas
  - Chama callback para remover da UI

**No Menu de Opções:**
```jsx
{isOwner && (
  <button onClick={() => handleDeletePost()} style={{color: '#ef4444'}}>
    🗑️ Deletar post
  </button>
)}
```

### 2. **Prestador.tsx** (Página de Perfil)

**Mudanças:**
- Importa `PostCard` para renderizar posts do usuário logado
- Nova função `fetchUserPosts()` centraliza busca de posts
- Nova função `handlePostDeleted()` remove post da lista local
- Lógica de renderização:
  - Posts do dono: renderiza como `PostCard` (com opção deletar)
  - Posts de outros: renderiza como thumbnail em grid

---

## 🧪 Como Testar

### ✅ Teste 1: Deletar Post Próprio
1. Faça login
2. Vá para seu perfil
3. Clique nos três pontos (⋮) de um post
4. Clique em "🗑️ Deletar post"
5. Confirme a deleção
6. ✓ Post desaparece da lista

### ✅ Teste 2: Visualizar Posts de Outros Usuários
1. Vá para o perfil de outro usuário
2. Posts aparecem como thumbnails
3. ✓ Nenhuma opção de deletar visível

### ✅ Teste 3: Verificar Integridade de Dados
1. Crie um post com:
   - Pelo menos 2 comentários
   - Pelo menos 2 likes
2. Deletar o post
3. ✓ Verificar no banco que comentários e likes foram removidos

---

## 📊 Fluxo de Dados

```
Frontend (Clique em Deletar)
         ↓
   Confirmação (Dialog)
         ↓
DELETE /api/posts/{id}
  + { userDocumento: "123" }
         ↓
Backend (PostController)
  ├─ Valida userDocumento
  ├─ Verifica propriedade
  ├─ Delete comments by postId
  ├─ Delete likes by postId
  ├─ Delete post
  └─ Return 200 OK
         ↓
Frontend (Callback)
  └─ Remove post da lista local
```

---

## 🔒 Segurança

| Aspecto | Implementação |
|---------|---------------|
| Propriedade | Valida `userDocumento` antes de deletar |
| Entrada | `userDocumento` obrigatório |
| Cascata | Deleta comentários e likes automaticamente |
| Status HTTP | 403 (Forbidden), 404 (Not Found) apropriados |
| Frontend | Verifica `isOwner` antes de exibir botão |

---

## 📝 Exemplos de Requisições

### Deletar Post
```bash
curl -X DELETE http://localhost:8080/api/posts/123 \
  -H "Content-Type: application/json" \
  -d '{"userDocumento":"12345678901"}'
```

**Respostas:**
- `200 OK`: `{"message": "Post deletado com sucesso"}`
- `403 Forbidden`: `{"error": "Você não tem permissão para deletar este post"}`
- `404 Not Found`: Post não encontrado
- `400 Bad Request`: `{"error": "userDocumento obrigatório"}`

---

## 📦 Arquivos Modificados

```
backend/src/main/java/com/lgi/
├─ repository/
│  ├─ CommentRepository.java          ✏️ +1 linha
│  └─ LikeRepository.java             ✏️ +1 linha
└─ controller/
   └─ PostController.java             ✏️ +20 linhas

frontend/src/
├─ components/
│  └─ PostCard.tsx                    ✏️ +25 linhas
└─ pages/
   └─ Prestador.tsx                   ✏️ +20 linhas
```

---

## 🎯 Requisitos Atendidos

- ✅ Opção de deletar aparece no menu de posts do perfil
- ✅ Interface tipo "post card" com menu de opções
- ✅ Emoji de lixeira (🗑️) para deletar
- ✅ Toda lógica necessária no backend
- ✅ Validação de propriedade do post
- ✅ Deleção em cascata (comments e likes)
- ✅ Confirmação antes de deletar
- ✅ Atualização instantânea da UI
- ✅ Tratamento de erros apropriado

---

## 🚀 Próximos Passos

1. Compile o backend: `mvn clean package`
2. Inicie o servidor: `java -jar target/lgi-backend-0.0.1-SNAPSHOT.jar`
3. Abra o frontend: `npm run dev`
4. Faça login e teste a funcionalidade
5. Verifique os logs do backend para qualquer erro

Enjoy! 🎉
