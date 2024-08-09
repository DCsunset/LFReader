import asyncio

# interval only applied when sequential is true
async def async_map(func, iter, sequential, interval=0):
  if sequential:
    result = []
    for item in iter:
      result.append(await func(item))
      if interval > 0:
        await asyncio.sleep(interval)
    return result
  else:
    return await asyncio.gather(*map(func, iter))
