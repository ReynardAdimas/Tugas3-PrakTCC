<script setup>
  import { ref, onMounted } from 'vue'
  import { getNotes, createNote, updateNote, deleteNote } from './services/api.js' 

  const notes = ref([])
  const loading = ref(false)
  const error = ref('') 
  const form = ref({judul:'', isi:''})
  const editingId = ref(null)
  const showForm = ref(false)

  const fetchNotes = async () => {
    loading.value = true 
    error.value = '' 
    try {
      const res = await getNotes()
      notes.value = res.data.data
    } catch (error) {
      error.value = 'Gagal memuat catatan. Coba lagi'
    } finally {
      loading.value = false
    }
  } 

  const openAddForm = () => {
    editingId.value = null 
    form.value = {judul:'', isi:''}
    showForm.value = true
  } 

  const openEditForm = (note) => {
    editingId.value = note.id 
    form.value = {judul: note.judul, isi: note.isi}
    showForm.value = true
  }

  const closeForm = () => {
    showForm.value = false 
    editingId.value = null 
    form.value = {judul:'',isi:''}
  } 

  const submitForm = async () => {
    if(!form.value.judul.trim() || !form.value.isi.trim()) {
      error.value = 'Judul dan isi tidak boleh kosong' 
      return
    }
    error.value = ''
    try {
      if(editingId.value) {
        await updateNote(editingId.value, form.value)
      } else {
        await createNote(form.value)
      }
      closeForm()
      await fetchNotes()
    } catch (err) {
      error.value = 'Gagal menyimpan catatan'
    }
  } 

  const handleDelete = async (id) => {
    if(!confirm('Yakin ingin menghapus catatan ini?')) return 
    try {
      await deleteNote(id)
      await fetchNotes()
    } catch (err) {
      error.value = 'Gagal menghapus catatan'
    }
  }

  onMounted(fetchNotes)
</script> 

<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
    <!-- Header -->
     <header class="bg-white shadow-sm border-b border-slate-200">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
            </svg>
          </div>
          <h1 class="text-xl font-bold text-slate-800">Notes App</h1>
        </div>
        <button @click="openAddForm" class="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg  class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Catatan
        </button>
      </div>
     </header>
    <!-- Main Content -->
     <main class="max-w-4xl mx-auto px-4 py-8">
      <!-- Error Alert -->
       <div v-if="error" class="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
        <span class="text-sm">{{ error }}</span>
        <button @click="error = ''" class="text-red-400 hover:text-red-600">X</button>
       </div>
       <!-- Loading -->
        <div v-if="loading" class="flex justify-center items-center py-16">
          <div class="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
        <!-- Empty State -->
         <div v-else-if="notes.length === 0 && !loading" class="text-center py-16">
          <div class="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg  class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 class="text-slate-500 font-medium">Belum ada catatan</h3>
          <p class="text-slate-400 text-sm mt-1">Klik "Tambah Catatan" untuk membuat catatan pertama</p>
         </div>

         <!-- Notes Grid -->
          <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="note in notes" :key="note" class="bg-white rounded-xl shadow-sm border border-slate-200 p-5 hover:shadow-md transition-shadow flex flex-col">
              <div class="flex-1">
                <h3 class="font-semibold text-slate-800 text-base mb-2 line-clamp-2">{{ note.judul }}</h3>
                <p class="text-slate-500 text-sm line-clamp-4">{{ note.isi }}</p>
              </div>
              <div class="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                <button @click="openEditForm(note)" class="flex-1 text-sm text-blue-600 hover:bg-blue-50 border border-blue-200 rounded-lg py-1.5 transition-colors font-medium">Edit</button>
                <button @click="handleDelete(note.id)" class="flex-1 text-sm text-red-600 hover:bg-red-50 border border-red-200 rounded-lg py-1.5 transition-colors font-medium">Hapus</button>
              </div>
            </div>
          </div>
     </main>
    <!-- Modal Form -->
     <div v-if="showForm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div class="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-lg font-semibold text-slate-800">{{ editingId ? 'Edit Catatan' : 'Tambah Catatan' }}</h2>
          <button @click="closeForm" class="text-slate-400 hover:text-slate-600 text-xl leading-none">X</button>
        </div>
        <div v-if="error" class="mb-4 text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{{ error }}</div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Judul</label>
            <input v-model="form.judul" type="text" placeholder="Masukkan judul catatan..." class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"/>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700">Isi Catatan</label>
            <textarea v-model="form.isi" rows="5" placeholder="Tulis isi catatan di sini..." class="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"></textarea>
          </div>
        </div>

        <div class="flex gap-3 mt-6">
          <button @click="closeForm" class="flex-1 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg py-2 text-sm font-medium transition-colors">Batal</button>
          <button @click="submitForm" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg py-2 text-sm font-medium transition-colors">{{ editingId ? 'Simpan Perubahan' : 'Tambah Catatan' }}</button>
        </div>
      </div>
     </div>
  </div>
</template>