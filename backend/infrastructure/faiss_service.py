
import   os
import faiss 
import torch
import numpy as np


class MyFaiss():
    """
        pass hidden_size of the dictionary, init will create an empty FlatIndex
        then use build_faiss(embeds_np) to add the dictionary embeddings into the index
        use search_faiss(query_emb, topk) for searching embeddings inside the index, this will return dictionary indices:
            For example if topk=3 and query_emb.shape[0] is 5, this will return (5, 3)
        load_faiss_index, load_faiss_index for saving the index on hard drive
    """

    def __init__(self, hidden_size):
        self.use_cuda = torch.cuda.is_available()
        self.faiss_index = None
        self.hidden_size = hidden_size
        self.dictionary_entries_n = None
        self._init_index()

    def _create_flat_index(self):
        if self.use_cuda:
            gpu_resources = faiss.StandardGpuResources()
            index_conf = faiss.GpuIndexFlatConfig()
            index_conf.device = torch.cuda.current_device()
            index_conf.useFloat16 = bool(self.use_amp)
            self.faiss_index = faiss.GpuIndexFlatIP(gpu_resources, self.hidden_size, index_conf)
        else:
            self.faiss_index = faiss.IndexFlatIP(self.hidden_size)


    def _init_index(self):
        self._create_flat_index()



    def build_faiss(self, embeds_np, batch_size=256):
        """
            Build with batches the faiss dictionary, 
            dictionary_input_ids + dictionary_attention_masks ==> embed ==> index.add(emb)
        """
        N = embeds_np.shape[0]
        self.dictionary_entries_n  = N


        if self.faiss_index is None:
            self._init_index()
        else:
            self.faiss_index.reset()
        assert self.faiss_index is not None
        assert self.dictionary_entries_n is not None

        for start in range(0, N, batch_size):
            end = min(start + batch_size, N)
            embs = embeds_np[start:end]
            self.faiss_index.add(embs)
            del embs


    def search_faiss(self, query_emb, topk=5):
        """
            For each query_batch, search top-k candidates from the dictionary
            Return candidates (queries_num , topk)
        """
        assert self.faiss_index is not None, 'FAISS index has to be loaded from path or initialized'
        _, result_indices = self.faiss_index.search(np.array([query_emb]), topk)
        return result_indices 


    def load_faiss_index(self, path):
        """
            Read FAISS index from path
        """
        assert os.path.exists(path),f'Path faiss {path} not exists'
        index = faiss.read_index(path)
        if self.use_cuda:
            gpu_resources = faiss.StandardGpuResources()
            co = faiss.GpuClonerOptions()
            co.allowCpuCoarseQuantizer = True
            index = faiss.index_cpu_to_gpu(gpu_resources, 0 , index, co)

        self.faiss_index = index

    def save_index(self, index_path):
        """
            Save index to save_index_path
        """
        if self.use_cuda:
            faiss.write_index(faiss.index_gpu_to_cpu(self.faiss_index), index_path)
        else:
            faiss.write_index(self.faiss_index, index_path)
