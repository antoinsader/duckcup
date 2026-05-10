

import os
import pytest
from infrastructure.utils.pkl import get_pkl



public_datasets_path = "/app/application/public_datasets"

class TestPublicDataset:

    def test_p_ds_content(self):
        file_name=os.path.join(public_datasets_path, "1024.pkl")
        content = get_pkl(file_name)
        assert content is not None and len(content) > 0 and isinstance(content[0], dict) and content[0]['message_id'] is not None 
