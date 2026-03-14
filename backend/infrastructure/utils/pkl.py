import pickle 
import os

from application.exceptions import InfrastructureError, INFRA_ERROR_LAYERS


def save_pkl(ar, fp):
    try:
        os.makedirs(os.path.dirname(fp), exist_ok=True)
        with open(fp, 'wb') as f:
            pickle.dump(ar, f)
    except (OSError, IOError) as ex:
        raise InfrastructureError(
            f"Failed to save file: {fp}",
            layer=INFRA_ERROR_LAYERS.STORAGE,
            priority=2,
            ex=ex
        )
    except pickle.PicklingError as ex:
        raise InfrastructureError(
            f"Failed to serialize object to: {fp}",
            layer=INFRA_ERROR_LAYERS.STORAGE,
            priority=2,
            ex=ex
        )

def get_pkl(fp):
    try:
        with open(fp, "rb") as f:
            return pickle.load(f)
    except FileNotFoundError as ex:
        raise InfrastructureError(
            f"File not found: {fp}",
            layer=INFRA_ERROR_LAYERS.STORAGE,
            priority=2,
            ex=ex
        )
    except (pickle.UnpicklingError, EOFError) as ex:
        raise InfrastructureError(
            f"Failed to deserialize file: {fp}",
            layer=INFRA_ERROR_LAYERS.STORAGE,
            priority=2,
            ex=ex
        )
    except (OSError, IOError) as ex:
        raise InfrastructureError(
            f"Failed to read file: {fp}",
            layer=INFRA_ERROR_LAYERS.STORAGE,
            priority=2,
            ex=ex
        )


def remove_file(fp):
    try:
        if os.path.exists(fp):
            os.remove(fp)
            return True
    except (OSError, IOError) as ex:
        raise InfrastructureError(
            f"Failed to delete file: {fp}",
            layer=INFRA_ERROR_LAYERS.STORAGE,
            priority=2,
            ex=ex
        )
