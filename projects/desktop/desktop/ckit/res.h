#pragma once
#include <expected>
template<class T> using Res = std::expected<T, std::exception>;
template<class T> using Err = std::unexpected<T>;
