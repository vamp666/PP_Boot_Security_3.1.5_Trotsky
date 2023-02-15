package ru.kata.spring.boot_security.demo.service;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import ru.kata.spring.boot_security.demo.entity.Role;
import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.repository.RoleRepository;
import ru.kata.spring.boot_security.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.TypedQuery;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@Transactional
public class UserService {
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private BCryptPasswordEncoder bCryptPasswordEncoder;

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private EntityManager em;

    public User getUserByEmail(String email) {
        /*
        // один из способов для устранения ошибки LazyInitializationException
        User user = userRepository.findByEmail(email);
        user.getRoles().iterator();
        return user;
        */
        // один из способов для устранения ошибки LazyInitializationException
        TypedQuery<User> user = em.createQuery(
                "SELECT u FROM User u LEFT JOIN FETCH u.roles WHERE u.email = :emailParam", User.class);
        user.setParameter("emailParam", email);
        return user.getSingleResult();
    }
    public User getUserById(long id) {
        return userRepository.findById(id).get();
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void save(User user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        Set<Role> roles = user.getRoles();
        Set<Role> rolesToPersist = new HashSet<>();
        for (Role role : roles) {
            Role persistedRole = roleRepository.findByRoleName(role.getRoleName());
            if (persistedRole == null) {
                rolesToPersist.add(role);
            } else {
                rolesToPersist.add(persistedRole);
            }
        }
        user.setRoles(rolesToPersist);
        userRepository.save(user);
    }

    public void update(User user) {
        User userToUpdate = userRepository.getById(user.getId());
        userToUpdate.setFirstName(user.getFirstName());
        userToUpdate.setLastName(user.getLastName());
        userToUpdate.setEmail(user.getEmail());
        userToUpdate.setAge(user.getAge());
        userToUpdate.setRoles(user.getRoles());
        if (user.getPassword() != null) {
            userToUpdate.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        }
        userRepository.save(userToUpdate);
    }

    public void delete(long id) {
        userRepository.deleteById(id);
    }

    public void setInitData() {
        if (userRepository.count() > 0) {
            return;
        }
        Role userRole = new Role("ROLE_USER");
        Role adminRole = new Role("ROLE_ADMIN");
        userRepository.save(new User("user", "user", (byte) 18, "user@gmail.com", bCryptPasswordEncoder.encode("user"), new HashSet<Role>() {{
            add(userRole);
        }}));
        userRepository.save(new User("admin", "admin", (byte) 1, "admin@gmail.com", bCryptPasswordEncoder.encode("admin"), new HashSet<Role>() {{
            add(userRole);
            add(adminRole);
        }}));
    }
}